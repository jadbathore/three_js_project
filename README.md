## Fonctionnement de three_js_project
Ce projet recoupe tous les fichiers en 1 seul pour par la suite être interprété de manière "classique" par un élément ejs il est utile pour des projets importants utilisant Three.js.<br>
L'utilité de ce projet réside dans la l'organisation des fichiers l'utilisation pratique du CLI intégrés et le système de serveur express permettant de render des pages de manière
dynamique par exemple.

### exemple :

![Enregistrement de l’écran 2024-08-08 à 10 58 07](https://github.com/user-attachments/assets/ae2ed9c7-48ac-4dca-8ee6-7ac5abdf1fdb)

> [!CAUTION]
> Nécessité d'avoir une base de Donnée mongoDB  ou d'avoir le logiciel compase déjà installé pour utiliser le ThreeCli
<p>
  L'utilisation du Cli intégrés permet d'effectuer des actions rapide et d'optimiser l'utilisation de cette boilerplate plusieur action son
  possible comme démontré ci dessous.
</p>
<img width="1208" alt="Capture d’écran 2024-08-08 à 10 17 04" src="https://github.com/user-attachments/assets/53312eef-0df0-4120-ad9a-72941e77eb49">

### arborescence du projet :

<img width="1208" alt="Capture d’écran 2024-08-08 à 11 18 37" src="https://github.com/user-attachments/assets/00d691a9-6dfb-4743-b19f-63af467b811a">

### Système de hachage
<p>
  Le projet possède un moyen de hachage dynamique pour chaque constant ce qui évite l'éventualité de double mention de constante.
  Ce hashage s'effectue durant un "save"(action cli : ThreeCli save -s <file>) 
</p>

<img width="581" alt="Capture d’écran 2024-08-08 à 11 21 02" src="https://github.com/user-attachments/assets/5ca631ca-5f1b-4ad9-92be-5ef0b3453e8a">

  ### exemple :
  Le hash ce fait également automatiquement quand on fait l'erreur de déclaré 2 fois la même constante :
```
  //document a.js

      const sphere = new THREE.Mesh(...)
      scene.add(sphere)

  //document b.js

      const sphere = "b"
      console.log(sphere)

  //document compling.js (après compilation des deux documents)

      ---a.js---
      const sphere = new THREE.Mesh(...)
      ---b.js---
      const sphere_66c3770bdbbd0e2d3bfd0137 = "b"
      console.log(sphere_66c3770bdbbd0e2d3bfd0137)
```
  

