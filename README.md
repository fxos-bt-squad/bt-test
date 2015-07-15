# BT Test App of Firefox OS

## How to install
1. Install bt-test using [WebIDE](https://developer.mozilla.org/en-US/docs/Tools/WebIDE/Running_and_debugging_apps)

2. If you have full gaia codebase, you could symbolically link bt-test to gaia/outoftree_apps folder

```sh
$> cd path/to/gaia
$> mkdir outoftree_apps  # create outoftree_apps folder if you don't have one
$> cd outoftree_apps
$> ln -s path/to/bt-test bt-test
```

Then building gaia in engineer build, you'll have bt-test installed in your runtime or device.

## Development

* Prerequisite
    - npm
    - gulp

```sh
$> npm install -g gulp
$> npm install
```

* lint/hint-as-you-save

```sh
$> gulp
```

## Reference
[https://wiki.mozilla.org/B2G/Bluetooth/WebBluetooth-v2](https://wiki.mozilla.org/B2G/Bluetooth/WebBluetooth-v2)
