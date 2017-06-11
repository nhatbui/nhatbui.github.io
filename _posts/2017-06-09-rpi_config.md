---
layout: post
title: The Complete Raspberry Pi Start Up Guide
description: Guide to Starting with our Raspberry Pi.
author: Nhat Bui
tags: programming, Raspberry Pi, security, ssh
category: programming
---

Follow these steps to quickly start up your Raspberry Pi.

1. Wire into the Raspberry
    1. Connect microUSB for power.
    2. Connect USB keyboard.
    3. Plug in the microSD [(with OS already installed)](https://www.raspberrypi.org/documentation/installation/installing-images/README.md).
    4. Plug in HDMI to Display.
    5. (optional) Connect USB mouse.

![Artist Rendition of Raspberry Pi]({{ site.baseurl }}/assets/raspberry_pi.png)

2. Change the default password for the __pi__ user.
    * Enter command

      ```$ sudo raspi-config
      ```

    * Navigate to the _Change User Password_ option.
    * Follow the on-screen instructions to change the password for the __pi__ user.
    * This is probably one of the simplest things you can do. Many people leave
      the default password and when they expose the Raspberry Pi to the world,
      [bad things happen](https://www.bleepingcomputer.com/news/security/linux-malware-mines-for-cryptocurrency-using-raspberry-pi-devices/).
3. Expand the filesystem to full capacity of the microSD.
    1. Enter command

        ```$ sudo raspi-config
        ```

    2. Navigate to _Advanced Options_.
    3. Select _Expand Filesystem_.
    4. Follow the on-screen commands. You'll be asked to reboot.
3. (optional) Enable ssh
    1. Enter command

        ```$ sudo raspi-config
        ```

    2. Select _Interfacing Options_
    3. Navigate to and select _SSH_
    4. Choose "Yes" to enable ssh.
    5. Select "Ok"
    6. Choose "Finish"
7. (optional) Connect to Ethernet/Wifi
    1. Ethernet: easy, plug in an Ethernet cable to the Ethernet port.
    2. Wifi: add the network configuration to `wpa_supplicant.conf`
        1. Enter command

            ```$ sudo vi /etc/wpa_supplicant/wpa_supplicant.conf
            ```

        2. Add entry

                network = {
                  ssid="The_SSID"
                  psk="Your_wifi_password"
		        }

        3. Enter command

            `$ sudo wpa_cli reconfigure`

        4. [More info](https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md)
8. Secure SSH:
    1. Edit file

        ```$ sudo vi /etc/ssh/sshd_config
        ```

    2. Do not allow root ssh (add/modify line to “PermitRootLogin no”)
    3. Limit user logins (add/modify line to “AllowUsers [username1] [username2] …”)
    4. Disable protocol 1 (Only have an entry for “Protocol 2”)
    5. (optional) change default port (add/modify line to "Port [some number]")
    6. (optional) filter SSH at firewall a.k.a. only allow certain IP addresses to SSH
    7. Use public/private key for authentication
        1. Move public key over
    8. Now disable password authentication (“PasswordAuthentication no”)
    9. Restart the ssh service

        ```$ sudo service ssh restart
        ```

    10. [More info](https://wiki.centos.org/HowTos/Network/SecuringSSH)

![Artist Rendition of Raspberry Pi Logo]({{ site.baseurl }}/assets/raspberry_pi_logo.png)
