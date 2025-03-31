## How three_js_project works
This project combines all the files into a single file to be interpreted in a "classic" way by an ejs element. It is useful for large projects using Three.js.<br>
The usefulness of this project lies in the organization of the files, the practical use of the integrated CLI, and the express server system, which allows you to render pages dynamically, for example.


### installation

- npm install
- ./bash/bin.sh (if you want to use https to test else it will be in http)
- start the project with npm start

### example:
![en utilisant le projet](https://github.com/user-attachments/assets/815de4d4-ab72-4f29-96fb-5797fa45b4db)

Command Prompt
---
<p>
Using the built-in CLI allows you to perform quick actions and optimize the use of this boilerplate. Several actions are possible, as demonstrated below.
</p>

  <img width="1509" alt="Capture d’écran 2024-11-05 à 16 14 50" src="https://github.com/user-attachments/assets/62435a55-b798-4465-95ac-77d5896c1206">

### docker:

> [!TIP]
> A Docker version of the command prompt is available if you don't want to install Mongo on your machine.

To build the container for the first time, make sure you're in the directory and run the command:
```
Docker-compose up
```
Then, to use the CLI, run the command:
```
docker exec -it ThreeCli sh -c "node bin/index.js"
```
If everything worked, you should see the table above.

#### Usage:

> [!TIP]
> To use the CLI, you should type the commands directly, ignoring ThreeCLi.
#### Example:
```
docker exec -it ThreeCli sh -c "node bin/index.js <command> <option> <param>"
                                                    │           │        │ 
                                                    V           V        V
                                                   save        -u       cube
                                                   fork        -sf      moon.js
                                                  (...)       (...)     (...)
```

project tree:
---
 
```
├── threeElement
│   ├── Animation
│   │   └── animate.js(default)
│   ├── Asset
│   │   ├── (...)
│   │   └── (...)
│   ├── Loader
│   │   ├── (...)
│   │   └── (...)
│   ├── Mesh
│   │   ├── (...)
│   │   └── (...)
│   └── Setting
│       ├── cameraSetting.js(default)
│       ├── configImport.js(default)
│       ├── RendererSetting.js(default)
│       └── resizeSetting.js(default)
└── Public
    ├── versionning
    │   ├── Compiling.js
    │   └── linkfile.js
    └── dist
        └── Compiling.js(default)
```

1) The ThreeElement folder will be compiled into a single class named Content in the Public/versioning/Compiling.js folder
2) Public/versioning/Compiling.js will itself be compiled by rollup in the Public/dist/Compiling.js folder
3) Public/dist/Compiling.js will be used as a script element on a page named index.ejs
4) This page will then be rendered using an Express server (some static elements will be stored in a cache)

Object NameSpace System:
---
The Object NameSpace system automatically creates a new JavaScript object that will act as a "namespace" to differentiate between two identical declarations.
#### Example:
```javascript
  //document a.js

const sphere = new THREE.Mesh(...)
scene.add(sphere)

  //document b.js

const sphere = "b"
console.log(sphere)

  //linkfile.js(compilation file) (after compilation of the two documents)

//---a.js---
const sphere = new THREE.Mesh(...)
//&end
//---b.js---
const _b_ = {}
_b_.sphere = "b"
console.log(_b_.sphere)
//&end


