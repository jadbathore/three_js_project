## Fonctionnement de three_js_project
Ce projet recoupe tous les fichiers en 1 seul pour par la suite être interprété de manière "classique" par un élément ejs il est utile pour des projets importants utilisant Three.js.<br>
L'utilité de ce projet réside dans la l'organisation des fichiers l'utilisation pratique du CLI intégrés et le système de serveur express permettant de render des pages de manière
dynamique par exemple.

### exemple :

![en utilisant le projet](https://github.com/user-attachments/assets/0ee77ce8-7565-401f-a247-b71919f994bf)

invité de commande
---
> [!CAUTION]
> Une version dockerise est en cour pour l'ajout de base de données mongoDB sans avoir à installé mongoDB sur la machine cependant il est toujour nécessaire d'avoir mongo déja installé 
<p>
  L'utilisation du Cli intégrés permet d'effectuer des actions rapide et d'optimiser l'utilisation de cette boilerplate plusieur action son
  possible comme démontré ci dessous.
</p>
  <img width="1509" alt="Capture d’écran 2024-11-05 à 16 14 50" src="https://github.com/user-attachments/assets/62435a55-b798-4465-95ac-77d5896c1206">

 arborescence du projet :
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

1) Le Dossier ThreeElement va etre compiler en 1 class nommé Content dans le dossier Public/versionning/Compiling.js 
2) Public/versionning/Compiling.js  va lui même etre compiler par rollup dans le dossier Public/dist/Compiling.js
3) Public/dist/Compiling.js va être utilisé comme element script sur une page nommé index.ejs
4) cette page et par la suite render grâce à un serveur Express (quelque élement static vont etre stocker dans un cache) 

Systeme de ObjectNameSpace:
---
 Le systeme de Object nameSpace crée de manière automatique un nouvel object Javascript qui aura la fonction de "namespace" permettant de differencier 2 déclaration identiques
#### Exemple:
```javascript
  //document a.js

  	const sphere = new THREE.Mesh(...)
  	scene.add(sphere)

  //document b.js

  	const sphere = "b"
  	console.log(sphere)

  //document fessant la compilation (après compilation des deux documents)

  	//---a.js---
  	const sphere = new THREE.Mesh(...)
  	//&end
  	//---b.js---
  	const _b_ = {}
  	const _b_.sphere = "b"
  	console.log(_b_.sphere)
  	//&end


