# MindfulSpace – Architecture Decision Record

**Projet :** MindfulSpace  
**Date :** 22/10/2025  
**Statut :** En cours  
**Auteur :** Équipe MindfulSpace

# Cap vers mobile : Capacitor (phase 2)

## Contexte
Afin d'améliorer l'engagement, l'équipe envisage de publier une application mobile en réutilisant le front web existant.

## Décision
Utiliser Capacitor pour empaqueter l'application web en application iOS/Android. Cibler d'abord 
des plugins simples (notifications locales, stockage) et stabiliser la PWA avant l'industrialisation mobile.

## Conséquences
- Réutilisation maximale du code et time-to-store réduit.
- Charge de maintenance supplémentaire pour les builds mobiles et les publications.
- Évolutions potentielles vers des plugins natifs spécifiques selon les besoins.

## Alternatives
React Native ou Flutter. Non retenus pour cette phase car impliquent une réécriture de l'interface 
et une pile technologique supplémentaire.
