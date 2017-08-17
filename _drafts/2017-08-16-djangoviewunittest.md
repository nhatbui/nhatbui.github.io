---
layout: post
title: Unit Testing Django Class-based Views
description: Unit Testing Django Class-based Views
author: Nhat Bui
tags: python, Django, views, unit test, testing, programming, web
category: programming
---

I'm not the first to notice the difficulties of unit testing in Django.
The [examples on the Django documentation](https://docs.djangoproject.com/en/1.11/topics/testing/)
are fine but they are more like integration tests. They involve using a
[mock client](https://docs.djangoproject.com/en/1.11/topics/testing/tools/#the-test-client) that retrieves
HTML from the Django app. So here's a short brief of how
to unit test class-based views in Django.


We have a fake restaurant review app. When a user queries for a restaurant, we retrieve the 
restaurant row from our database but manipulate the values before showing our viewers.
Sure we could parse the returned HTML if we use the test client but that's not compartmentalizing
our functionality: the work is done in `get_context_data` so why can't we just test it there and
make sure we get things as expected?

```
from django.views.generic.detail import DetailView


class RestaurantView(DetailView):
    def get_context_data(self, **kwargs):
        context = super(RestaurantView, self).get_context_data(**kwargs)

        // fancy stuff

        return context
```

The test

```
class PelpTestCase(TestCase):
    def test_restaurant_view():
        # what do I do?!
```

# Pass a request to dispatch()
You need to use the request factory to instantiate a mock request and
then pass it to the dispatch method().

```
request = self.factory.get('/restaurant')
my_view.dispatch(request)
```

# Call get_object() and then set the object inside the view

```
object = my_view.get_object()
my_view.object = object
```

# Now test the context

```
context = my_view.get_context_data()

assert(context ...)
```

It's quite simply. The only hard part I've done here is show that how we
mimic the Django internals so that we can unit test the methods we've overridden
in the class-based view. All I've really saved you is looking at the Django source.

To do this for other views, I would check out the [reference documentation of 
the class-based view](https://docs.djangoproject.com/en/1.11/ref/class-based-views/),
look at the __Method Flowchart__ ([ex](https://docs.djangoproject.com/en/1.11/ref/class-based-views/generic-display/#detailview)),
and visit the source to see how values/functions are used up to the part you want to unit test.
