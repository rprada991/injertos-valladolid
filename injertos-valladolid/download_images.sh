#!/bin/bash

# Crear directorios si no existen
mkdir -p images/{hero,services,gallery,team,blog}

# Hero images
curl -L "https://images.unsplash.com/photo-1612776572997-76cc42e058c3" -o images/hero/hero1.jpg
curl -L "https://images.unsplash.com/photo-1579684385127-1ef15d508118" -o images/hero/hero2.jpg

# Services images
curl -L "https://images.unsplash.com/photo-1551076805-e1869033e561" -o images/services/fue.jpg
curl -L "https://images.unsplash.com/photo-1579684453423-f84349ef60b0" -o images/services/dhi.jpg
curl -L "https://images.unsplash.com/photo-1607990283143-e81e7a2c9349" -o images/services/prp.jpg
curl -L "https://images.unsplash.com/photo-1516549655169-df83a0774514" -o images/services/micropigmentacion.jpg

# Gallery images
curl -L "https://images.unsplash.com/photo-1622253692010-333f2da6031d" -o images/gallery/before-after1.jpg
curl -L "https://images.unsplash.com/photo-1612776572997-76cc42e058c3" -o images/gallery/before-after2.jpg
curl -L "https://images.unsplash.com/photo-1579684385127-1ef15d508118" -o images/gallery/before-after3.jpg

# Team images
curl -L "https://images.unsplash.com/photo-1622253692010-333f2da6031d" -o images/team/doctor1.jpg
curl -L "https://images.unsplash.com/photo-1559839734-2b71ea197ec2" -o images/team/doctor2.jpg

# Blog images
curl -L "https://images.unsplash.com/photo-1579684453423-f84349ef60b0" -o images/blog/cost.jpg
curl -L "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c" -o images/blog/procedure.jpg
