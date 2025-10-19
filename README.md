# WearAndShare - Aplicación Móvil de Moda

> **⚠️ Diseño Mobile-First**: Esta aplicación está específicamente diseñada para dispositivos móviles. Para la mejor experiencia, por favor úsala en un smartphone o tablet.

## 🏆 Picanthon 2025 - Equipo Waven

Este proyecto es desarrollado por el **Equipo Waven** para la competencia Picanthon 2025. Estamos construyendo el futuro de la tecnología de moda con experiencias de prueba virtual impulsadas por IA.

## 📱 Sobre la Aplicación

WearAndShare es una aplicación móvil revolucionaria de moda que permite a los usuarios:

- **Prueba Virtual**: Ver cómo te quedan las prendas usando tecnología de IA
- **Gestión de Ropero**: Organizar y gestionar tu colección personal de ropa
- **Compartir Social**: Compartir tus outfits e inspirarte con otros

## 🚀 Comenzar

### Prerrequisitos

- Node.js (v18 o superior)
- Gestor de paquetes npm o pnpm
- Dispositivo móvil o navegador móvil para la mejor experiencia

### Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd wearandshare
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env.local
   # Agregar tus credenciales de Supabase y otras API keys
   ```

4. **Ejecutar el servidor de desarrollo**

   ```bash
   npm run dev
   # o
   pnpm dev
   ```

5. **Abrir en navegador móvil**
   - Navegar a `http://localhost:3000`
   - **Importante**: Usar tu dispositivo móvil o navegador móvil para la mejor experiencia
   - Para pruebas en escritorio, usar herramientas de desarrollador del navegador con vista móvil

## 📱 Instrucciones de Uso Móvil

### Para la Mejor Experiencia:

1. **Usar un dispositivo móvil** - La app está optimizada para interacciones táctiles
2. **Habilitar permisos de cámara** - Requerido para las funciones de prueba virtual
3. **Usar orientación vertical** - Diseñada para modo retrato móvil
4. **Conexión estable a internet** - El procesamiento de IA requiere buena conectividad

### Características Principales:

- **📸 Prueba Virtual**: Sube tu foto y prueba diferentes outfits
- **👗 Ropero**: Agregar y organizar tus prendas de ropa
- **📱 Optimizado para Móvil**: Interfaz táctil diseñada para smartphones
- **🤖 Impulsado por IA**: IA avanzada para detección de ropa y prueba virtual

## ⚠️ Descargo Importante sobre IA

### Limitaciones del Modelo de Extracción de Ropa

### **Importante para los Jueces**:

- **Uso de la aplicacion** Para probar la aplicacion tan solo con entrar al link adjunto ya es suficiente, en caso de querer correrlo localmente, seguir las instrucciones previas. (Se nos tiene que pedir las claves de Supabase)
- **Modelo de Extracción**: El modelo que extrae prendas de ropa de las imágenes puede fallar ocasionalmente
- **Ropero Virtual**: Las prendas que están actualmente en el ropero virtual fueron obtenidas exitosamente usando nuestro modelo de IA
- **Detección de Prendas**: El sistema puede no detectar todas las prendas en una imagen, especialmente con fondos complejos o múltiples prendas superpuestas
- **Calidad de Imagen**: La precisión mejora significativamente con imágenes de alta calidad y buena iluminación
- **Prueba de prendas virtual** A diferencia del extractor de prendas, este modelo en imagenes con una calidad de imagen aceptable ya obteiene resultados positivos casi el 100 porciento del tiempo.

- Para la prueba de la aplicacion se adjunta una imagen de prueba que deberia funcionar bien, pero nuevamente el modelo no esta completamente refinado por lo que puede fallar.

### Características Beta

- Algunas funciones pueden no funcionar perfectamente
- El rendimiento puede variar dependiendo del dispositivo y condiciones de red
- Los tiempos de procesamiento de IA pueden variar

### Flujo de uso recomendado

- En la zona del ropero virtual (icono de camiseta en el menu) ingresar la imagen adjuntada (outfit.jpeg) tocando el boton 'Add Photo' para que se agreguen las prendas al ropero. Comprobar que el modelo devolvio bien el tipo de prenda ya que en caso de que el tipo de prenda este marcado incorrectamente, esto complicaria su uso. Si la carga no es exitosa, volver a intentar o seguir en el proximo paso con las prendas ya cargadas.
- Seguiendo, presionar el boton 'Create Outfit' para crear un outfit con las prendas deseadas. Tener en cuenta que para crear un outfit se necesita de 1 top, 1 bottom y 1 shoe. Ya hay prendas cargadas que lo permiten hacer. Guardar.
- Luego ir a la seccion de 'Saved Outfits' para probar el nuevo outfit. Cuando se haya elegido el outfit a probar, se debe presionar el boton de 'Try On'. Para esta prueba tambien adjuntamos una imagen (persona.jpeg) pero son libres de probarlo en ustedes mismos o con la imagen que quieran..
- Una vez probado el outfit, crear una publicacion con el boton '+' en el centro del menu.

## 🛠️ Desarrollo

### Stack Tecnológico

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase
- **IA/ML**: Modelos de IA Nano Banana para detección de ropa y prueba virtual
- **Móvil**: Capacidades de Aplicación Web Progresiva (PWA)

### Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint
```

## 🤝 Contribución

Este proyecto es parte de Picanthon 2025. Para contribuciones o preguntas:

- **Equipo**: Waven
- **Evento**: Picanthon 2025
- **Enfoque**: Tecnología de moda impulsada por IA

---

**Recuerda**: ¡Esta es una aplicación mobile-first. Para la mejor experiencia, por favor úsala en un dispositivo móvil! 📱✨

###

Imagenes
'./images/outfit.jpeg'
'./images/person.jpeg'

###
