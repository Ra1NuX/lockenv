
# Lockenv

lockenv is a system to have centralized all your environment variables, to be able to have different projects and an easy and simple way to switch between them.

## Installation

*In order to use this CLI you will have to clone the original repository, enter the folder and use the commands to connect bun to a repository:*

> [!INFO]
> ⚠️ The first command may fail because of the time it takes for the database to be created, so I recommend using lockenv list to make it fail and then you can use the commands correctly.

```bash
mkdir lockenv && cd lockenv
```
```bash
git clone https://github.com/Ra1NuX/lockenv.git .
```
```bash
bun link
```
```bash
bun link lockenv
```
> [!WARNING]
> ⚠️ In the latest versions of bun.sh it may be that the bun link is not working correctly.

---
`

> [!CAUTION]
> I am not at all sure that this way will work

**Install lockenv with npm:**
```bash
  npm install -g lockenv
```
    
**Install lockenv with bun:**
```bash
  bun add -g lockenv
```

## Tech Stack

**CLI**: To use this CLI you will probably need to install bun.sh to use it.
[Install bun](https://bun.sh/docs/installation)

## Roadmap

* [ ]  Integration with MS2 systems.
* [ ]  Add more configuration like where the bbdd save at.
* [ ]  Add integration to remote bbdd.
* [ ]  Add integration with remote hub.

