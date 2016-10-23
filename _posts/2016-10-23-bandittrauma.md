---
layout: post
title: Bandits for Trauma Response: A Practical Walkthrough
description: Exploring, with code, a use case for bandit algorithms relating to the PIPT
author: Nhat Bui
tags: programming, data science, machine learning
category: programming
---

# Assessing the best EMT response using Bandit Algorithms

A [controversial experiment is being performed in Philadelphia](http://www.npr.org/sections/health-shots/2016/10/20/496828573/will-a-study-save-victims-of-violence-or-gamble-with-their-lives). Researchers are exploring the appropriate response for a gunshot or stab victim: whether the victim receives advanced care at the scene or if they receive only basic care before being transported to a nearby hospital. Dr. Zoe Maher, trauma surgeon, mother, and a researcher conducting this study, asserts that it is better for victims to receive basic care until they reach the hospital. Her colleagues and she believe that advanced care, such as IV fluids
and breathing tubes, will disrupt the body's natural measures of preventing blood
like the constriction of blood vessels and the forming of clots.

Most of the controversy from this study, at least from what the article describes, is due to how the study is conducted. Depending on the dispatch number of the city paramedics...

* odd numbers will carry out advanced care
* even numbers will provide basic care

Just focusing on appearances, the words "advanced" and "basic" imply that half of the
future stab and gunshot victims in Philadelphia will just randomly get sub-bar
care (because "advanced" is better than "basic", right?). It's reasonable to see
how the population may be worried.

I want to do a basic intro to bandit algorithms and why they're better for this
type of experiment. Then I want to motivate [contextual bandits](http://hunch.net/?p=298)
as the further improved approach.

This post is a practical walkthrough of a [previous post](http://www.nhatqbui.com/programming/2016/10/20/PIPT.html).

## Creating some data

I looked everywhere for data to use in the project. I would imagine between patient information and the difficulty of collecting data in an emergency medical situation, this data is not readily available. So let's make up some data that would most likely represent this scenario.

We're going to create a class that outputs emergency events for us. It's over-simplified. The probability of survivability is fixed and is dependent on the type of emergency and the treatment administered.


```python
import random

emergency_type = ['stab', 'gunshot']

class SimpleEmergency:
    def __init__(self):
        self.emergency_type = random.choice(emergency_type)

    def apply_treatment(self, treatment):
        '''
        A very simplified model of the emergency and the outcome based on treatment.
        Outcome is treated as P(survive | (treatment, emergency_type))

        P( survive | (stab, basic)) = .6
        P( survive | (stab, advanced)) = .5
        P( survive | (gunshot, basic)) = .75
        P( survive | (gunshot, advanced)) = .45
        '''

        # If it was a stab wound and the basic treatment was applied.
        if (self.emergency_type == 'stab') and (treatment == 'basic'):
            if random.random() > .6:
                return True
            else:
                return False
        # If it was a stab wound and the advanced treatment was applied.
        elif (self.emergency_type == 'stab') and (treatment == 'advanced'):
            if random.random() > .5:
                return True
            else:
                return False
        # If it was a gunshot wound and the basic treatment was applied.
        elif (self.emergency_type == 'gunshot') and (treatment == 'basic'):
            if random.random() > .75:
                return True
            else:
                return False
        # If it was a gunshot wound and the advanced treatment was applied.
        elif (self.emergency_type == 'gunshot') and (treatment == 'advanced'):
            if random.random() > .45:
                return True
            else:
                return False
```

## The Bandit

Now let's jump right into the bandit! We're going to be looking at one of the most popular bandit algorithms, the Upper Confidence Boundary (UCB) Bandit. Before we look at the code, let me give a description of the UCB bandit.

A bandit explores and exploits. That means according to its policy, when presented with a trial from the environment, the agent, our dearly beloved bandit, will choose whether to try action and assess the received reward (_explore_) or it will choose the action that has been the most beneficial (_exploit_). You can generalize that bandits differ essentially by this policy for exploration vs. exploitation. The UCB bandit's policy will always choose the best arm that has historically given it the most reward __BUT__ it will try different arms if it hasn't tried them in a while.

_"How the hell does that work?"_

Well the UCB defines a function as follows:

    action.value + sqrt((2 * log(total_counts)) / float(action.count))
    ^              ^
    |__ term 1     |______ term 2

    - total_counts : number of times the bandit was faced with a decision and chose an arm.
    - arm.count    : number of times this action has been chosen.
    - arm.value    : historical average for reward received for this action.

### Term 1

    action.value

As described above, __term 1__ is the historical average for the reward of this particular action.

### Term 2

    sqrt((2 * log(total_counts)) / float(action.count))

But __term 2__ does all the magic for exploration. __Term 2__ is a large number when `total_counts` is large and `action.count` is small. Interpreted, that means __term 2__ is large when a long period of time has passed without trying the action.

But there's more to it!

### All together now

Together, __term 1__ and __term 2__ create a _value_ used by the bandit to choose which action to try. The bandit will always choose the action with the highest _value_. An action could have a low, historical reward (__term 1__) but if it's been long enough for __term 2__ to be large, the bandit will try that action. This has the very cool effect of trying poorer performing arms less!

The UCB bandit will try poorer performing arms in the future. Is this a good thing or a bad thing. It depends on the environment. If this is a static environment, meaning there is an absolute best action for the bandit, then this is not an ideal feature of UCB. It will all try poorer performing arms though more infrequently as time progresses. If the environment is dynamic and the best decisions change over time, then this is a good feature. The bandit may try different arms and notice that the rewards are different. This in turn changes how it decides which arm to pick in the future.

So finally, let's look at the entire code for the UCB bandit.
[Code](https://github.com/johnmyleswhite/BanditsBook/blob/master/python/algorithms/ucb/ucb1.py) from the great John Myles White (@johnmyleswhite) whose [book is highly recommended](http://shop.oreilly.com/product/0636920027393.do) (and from which this slightly-edited code excerpt comes from).


```python
import math

def ind_max(x):
  m = max(x)
  return x.index(m)

class UCB1():
  def __init__(self, n_arms):
    self.initialize(n_arms)
    return

  def initialize(self, n_arms):
    self.counts = [0 for col in range(n_arms)]
    self.values = [0.0 for col in range(n_arms)]
    return

  def select_arm(self):
    n_arms = len(self.counts)
    for arm in range(n_arms):
      if self.counts[arm] == 0:
        return arm

    ucb_values = [0.0 for arm in range(n_arms)]
    total_counts = sum(self.counts)
    for arm in range(n_arms):
      # IMPORTANT STUFF!
      bonus = math.sqrt((2 * math.log(total_counts)) / float(self.counts[arm]))
      ucb_values[arm] = self.values[arm] + bonus
    return ind_max(ucb_values)

  def update(self, chosen_arm, reward):
    self.counts[chosen_arm] = self.counts[chosen_arm] + 1
    n = self.counts[chosen_arm]

    value = self.values[chosen_arm]
    new_value = ((n - 1) / float(n)) * value + (1 / float(n)) * reward
    self.values[chosen_arm] = new_value
    return
```

## Other Bandits

As mentioned earlier, there are other bandits. They differ mostly in how their policy dictates exploration vs. exploitation. Here are some:

* [UCB2](https://github.com/johnmyleswhite/BanditsBook/blob/master/python/algorithms/ucb/ucb2.py)
* [Epsilon-Greedy](https://github.com/johnmyleswhite/BanditsBook/blob/master/python/algorithms/epsilon_greedy/standard.py)
* [Epsilon-Greedy with Simulated Annealing](https://github.com/johnmyleswhite/BanditsBook/blob/master/python/algorithms/epsilon_greedy/annealing.py)
* [EXP3](https://github.com/johnmyleswhite/BanditsBook/blob/master/python/algorithms/exp3/exp3.py)
* [Hedge](https://github.com/johnmyleswhite/BanditsBook/blob/master/python/algorithms/hedge/hedge.py)
* [Softmax](https://github.com/johnmyleswhite/BanditsBook/blob/master/python/algorithms/softmax/standard.py)
* [Softmax with Simulated Annealing](https://github.com/johnmyleswhite/BanditsBook/blob/master/python/algorithms/softmax/annealing.py)

## Testing our Bandit

Let's test our bandit! The simulation will run as follows:


```python
def train_UCB1(trials, arm_labels):

    # Initialize bandit with the number of actions it can perform.
    bandit = UCB1(len(arm_labels))

    for _ in range(trials):
        # Create one emergency situation
        e = SimpleEmergency()

        # The bandit will select an action, an arm.
        action = bandit.select_arm()

        # See if the action, the treatment, is a success or not.
        success = e.apply_treatment(arm_labels[action])

        # If it's successful...
        if success:
            # We reward the action.
            bandit.update(action, 1.0)
        else:
            # We don't reward the action.
            bandit.update(action, 0.0)

    return bandit
```

## Inspection

Let's inspect our bandit to see how it decides.


```python
trials = 1000
treatments = ['basic', 'advanced']

bandit = train_UCB1(trials, treatments)

for treatment, value in zip(treatments, bandit.values):
    print('{}: {}'.format(treatment, value))
```

    basic: 0.3064516129032258
    advanced: 0.5194063926940644


The larger number indicates the action that is best!

Note: this result has no meaning on the Philadelphia experiments. Why? Because our data is made up! In fact, you should play with the percentages to see how it changes the outcome!

## Why Bandits though?

So we talked about bandits and how it can be used in this context. But why should we?

Consider how the Philadelphia experiment is set-up. It's set-up much like how A/B testing sets up experiments: divide population in number of groups corresponding to the experimental parameters you would like to test. In this case, the population is divided in two, one for 'basic' treatment and the other for 'advanced' treatment.

Let's make these differing approached face-off against one another! Let the most accurate win!


```python
def bandit_vs_AB():

    trials = 1000
    treatments = ['basic', 'advanced']
    bandit = UCB1(len(treatments))
    bandit_score = 0
    AB_score = 0

    for i in range(trials):
        # Create one emergency situation
        e = SimpleEmergency()

        # Bandit
        action = bandit.select_arm()
        bandit_treatment = treatments[action]

        bandit_success = e.apply_treatment(bandit_treatment)
        if bandit_success:
            bandit.update(action, 1.0)
            bandit_score +=1
        else:
            bandit.update(action, 0.0)

        # A/B
        if (i % 2) == 0:
            AB_treatment = treatments[0]  # basic
        else:
            AB_treatment = treatments[1]  # advanced

        AB_success = e.apply_treatment(AB_treatment)
        if AB_success:
            AB_score += 1

    return bandit_score, AB_score
```

and the winner is...


```python
for setup, score in zip(['bandit', 'A/B'], bandit_vs_AB()):
    print('{} : {}'.format(setup, score))
```

    bandit : 470
    A/B : 402


Bandits win!!!

## How?

Bandit algorithms choose actions based on historical rewards per action. As it learns which action is the most fruitful, it chooses it more and more (I know I'm repeating myself at this point). This means we are able to benefit while learning about the experiment! So for Philadelphia, researchers can explore treatments early on in the experiment. But as time progresses, they start to get a sense of what works better and they start administering that action more and more.

## Contextual Bandits

During the progression of the argument for bandits, I'm sure most of you thought, "this view is way too simplistic!". You're right. In real life, there is much more information available than just 'gunshot' or 'stab'. In fact, some of you may have notice in the code that `select_arm()` doesn't event take an argument (for you all-star, snake-charming Pythonistas out there, yes, there is actually an argument, `self`, but you know what I mean :) )! That's the amazing thing about this bandits: it doesn't need a model of the environment! It proceeds solely off of the action-rewards interaction. But we're smart data scientists! We want to take advantage of all the information possibly available. __Enter contextual bandits.__

Up until this point, our bandit only decides one action that applies to both 'stab' and 'gunshot' scenarios. But as many of you could imagine, it could vary. Perhaps 'basic' treatment works better for one or the other. In fact there may be other factors at play. Emergencies should actually look like...

(note: at this point, the code is mainly to communicate my point. The fake data is starting to get really...fake).


```python
regions = ['head', 'torso', 'arm/leg']

class RealEmergency:
    def __init__(self):
        self.emergency_type = random.choice(emergency_type)
        self.age = random.randint(18, 65)
        self.time_since_arrival = random.randint(60, 1080)  # seconds. Assume in Philly, all locations are within 18 min. of an ambulance
        self.location_of_injury = random.choose(regions)
        self.multiple_wounds = bool(random.randbits(1))
        self.time_to_hospital = random.randint(60, 1080)  # seconds. Refer to "time since arrival" assumption.
        # and possibly many others....

    def apply_treatment(self, treatment):
        # The following is used to mock a distribution of survivability over the parameters above.
        # IT IS NOT SCIENCE! It is only used for simulation!

        val = 0.0
        if self.emergency_type == 'stab':
            val = 3.42
        else:
            val = 9.6
        if random.betavariate(
            self.age/self.time_since_arrival + val,
            self.location_of_injury + self.multiple_wounds + self.time_to_hospital
        ) > .4:
            return True
        else:
            return False
```

Given all this new information, how should the bandit deal with it?

Well, when it decides which action to take, it should account for the context!


```python
class ContextualBandit():
    def select_arm(self, context_vector):
        # map context_vector to some qualitative value per arm.
        # Let W_i be a 1-by-n vector where the context_vector is the column vector n-by-1.
        # i is the arm index

        arm_values = [0.0 for arm in range(self.n_arms)]
        for i in self.n_arms:
             arm_values[i] = W_i[i] * context_vector  + calc_exploration_value(i) # we can add another term like in UCB too!

        return ind_max(arm_values)

    def update(self, context_vector, arm, reward):
        # perform an update on the arm's historical reward.
        update_arm(arm, reward)

        # Update our W row-vector
        loss = compute_loss(context_vector, W_i[arm])
        update_W(W_i[arm], loss)
```

Notice that the bandit above basically wraps a linear regression model to map the context to a reward.

Remember, a bandit algorithm dictates a policy for exploration vs. exploitation. In a sense, bandit algorithms and reinforcement learning in general are just frameworks for learning. They are not disjoint from supervised and unsupervised learning.

There are other contextual bandits. And they can be extremely complex. This one is actually considered pretty naive for a contextual bandit. I just want to show you how you take advantage of the context of a decision.

## Conclusion

Don't forget about bandit algorithms. Canonical examples for applications of bandit algorithms are health/medical experiments such as the ones being conducted in Philadelphia.
