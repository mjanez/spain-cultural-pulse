NORPOL |Normas sociales en la política



INFORMACIÓN GENERAL

1. Título del dataset:

   Estudio sobre Normas Sociales en la Política, 2024


2. Autores:

   Luis Miguel Miller Moya (ORCID: 0000-0002-7447-2313)
   Isabel Rodríguez Marín (ORCID: 0000-0003-2363-3700)
   Juan Vicente Castellanos Quintana (ORCID: 0000-0002-6331-2197)


3. Fecha de recolección de los datos:

   2024-06-21 to 2024-07-02


4. Fecha de publicación de los datos en el repositorio:

   02/09/2025


5. Ubicación geográfica de la recolección de datos (latitud, longitud, o ciudad/región, país, continente según corresponda):

   España


6. Información sobre las fuentes de financiamiento que apoyaron la recolección de los datos (incluyendo referencia o acrónimo del proyecto de investigación):

   Financiado por la Agencia Estatal de Investigación (Referencia: PID2022-136474NB-I00)


7. Citación recomendada para este dataset:

Miller, Luis M.; Rodríguez Marín, Isabel; Castellanos Quintana, Juan Vicente; 2025; Estudio sobre Normas Sociales en la Política, 2024 [Dataset]; DIGITAL.CSIC; https://doi.org/10.20350/digitalCSIC/17529


INFORMACIÓN SOBRE COMPARTICIÓN/ACCESO/CONTEXTUALIZACIÓN

1. Licencias de uso/restricciones impuestas sobre los datos (por favor indique si los archivos de datos tienen diferentes licencias de uso): CC BY NC 4.0

   


2. Enlaces a publicaciones/otros resultados de investigación que citan los datos:

   Ninguno en el momento de la publicación.


3. Enlaces a publicaciones/otros resultados de investigación que usan los datos:

   Ninguno en el momento de la publicación.


4. Enlaces a otras ubicaciones accesibles públicamente de los datos:

   Ninguno en el momento de la publicación.


5. Enlaces/relaciones con conjuntos de datos auxiliares:

   Ninguno en el momento de la publicación.


6. ¿Los datos fueron derivados de otra fuente? En caso afirmativo, por favor añada el enlace donde se encuentra dicho trabajo:

   No, todos los datos fueron recopilados por el estudio sin recurrir a fuentes secundarias.



DESCRIPCIÓN DE LOS DATOS Y ARCHIVOS

1. Lista de archivos:

   NORPOL_dataset_brutos_2024.csv
   NORPOL_dataset_limpios_2024.csv
   NORPOL_cuestionario_2024.pdf
   NORPOL_libro_de_códigos_2024.pdf


2. Relación entre los archivos, si es importante:

   El Libro de Códigos proporciona las descripciones de codificación para las variables del dataset.
   El cuestionario contiene las preguntas y opciones de respuesta del estudio.


3. Datos adicionales recolectados que no fueron incluidos en el paquete actual de datos:

   No hay datos adicionales.


4. ¿Existen múltiples versiones del dataset? En caso afirmativo, por favor indique dónde se encuentran:

   No, esta es la única versión del dataset disponible actualmente.



INFORMACIÓN METODOLÓGICA

1. Descripción de los métodos utilizados para la recolección/generación de los datos:

   Los datos se recopilaron mediante una encuesta estructurada en línea (CAWI) entre junio y julio de 2024. La muestra estuvo compuesta por 3015 individuos de 18 años o más con 
   nacionalidad española (incluida la doble nacionalidad), seleccionados mediante muestreo aleatorio estratificado por género, nivel educativo, edad, tamaño del municipio y distribución 
   regional, a partir del panel NETQUEST.


2. Métodos para procesar los datos:

   Los datos recopilados fueron sometidos a un riguroso proceso de limpieza y recodificación para garantizar su calidad, consistencia y disponibilidad. El procesamiento relizado en el 
   archivo NORPOL_dataset_limpios_2024.csv incluye los siguientes pasos:

   (1) Se reorganizaron las variables y se eliminaron aquellas que eran irrelevantes o tenían información duplicada.

   (2) Se corrigió el intercambio de nombres entre las variables D7_POBLACION y D7_CP, lo que provocaba una asignación incorrecta de valores. Asimismo, se subsanaron errores en los códigos 
       municipales y se eliminaron códigos postales inexistentes.

   (3) Se recodificaron determinadas variables para unificar el valor 0 como etiqueta asociada a la respuesta negativa "No".

   (4) Se recodificaron los valores de P3_2 para invertir los códigos, de modo que "Sí" corresponda a 1 y "No" a 0.

   (5) En todas las preguntas de opción múltiple que incluían una variable adicional para la opción "Prefiero no contestar", se asignó el valor 99 a todos los ítems individuales 
       cuando dicha variable presentaba el valor 1 en un participante.

   (6) Las respuestas abiertas introducidas en la categoría "Otros" fueron revisadas y, cuando fue posible, reasignadas a una opción ya existente en el cuestionario. El resto fueron 
       recodificadas para agruparlas en una categoría más amplia o directamente eliminadas si eran genéricas o no aportaban información útil.

   (7) Se recodificaron las variables que preguntaban por la serie de televisión favorita (P1.8), el videojuego de ordenador, consola o móvil favorito (P1.9) y las ocupaciones 
       desempeñadas en el empleo (P6.3) usando Microsoft Copilot como herramienta de IA. En los dos primeros casos, se procedió a normalizar el texto; eliminar términos inválidos, 
       negaciones, plataformas, géneros, etc.; corregir errores tipográficos; traducir al idioma más recurrente; identificar las franquicias y borrar aquellas duplicadas en un mismo 
       participante cuando ve más de una serie o juega a más de un videojuego que forma parte de la misma franquicia; y examinar manualmente aquellas series de televisión o videojuegos 
       que no era capaz de clasificar la IA.

       Por un lado, se identificaron 14 franquicias que agrupaban series comúnmente conocidas por su título original o principal, y que gozan de amplio reconocimiento en la cultura popular: occidental.

      	- 9-1-1
      	- Battlestar Galactica
      	- Chicago
     	- CSI
        - DC Comics
        - Dragon Ball
        - FBI
        - Ley y Orden
     	- Marvel
       	- NCIS
       	- Rex
       	- Star Trek
       	- Star Wars
        - Stargate

       Por otro lado, se identificaron 80 franquicias que agrupan videojuegos comúnmente conocidos por su título original o principal, y que gozan de amplio reconocimiento en la cultura 
       gamer occidental:

        - Age of Empires
        - Animal Crossing
        - Asphalt
        - Assassin's Creed
	- Bubble Bobble
	- Burnout
	- Call of Duty
	- Candy Crush
	- Civilization
	- Clash
	- Colin McRae Rally
	- Command & Conquer
	- Counter-Strike
	- Crash Bandicoot
	- Delicious-Emily’s
	- Diablo
	- Doom
	- Dragon Ball
	- Empire Earth
	- Fallout
	- Far Cry
	- Farm Heroes
	- FIFA
	- Final Fantasy
	- Formula 1
	- Gears of War
	- God of War
	- Gran Turismo
	- Grand Theft Auto
	- Halo
	- Harry Potter
	- Horizon
	- Just Dance
	- Layton
	- League of Legends
	- LEGO
	- Los Simpson
	- Los Sims
	- Mafia
	- Mario	
	- Mass Effect
	- Metal Gear Solid
	- Micro Machines
	- Monkey Island
	- Monster Hunter
	- Mortal Kombat
	- MotoGP
	- NBA
	- NBA 2K
	- Need for Speed
	- Pang
	- Persona
	- Pokémon
	- Prince of Persia
	- Pro Evolution Soccer
	- Ratchet & Clank
	- Rayman
	- Red Dead Redemption
	- Resident Evil
	- SimCity
	- SingStar
	- Sniper Elite
	- Sniper Ghost Warrior
	- Sonic
	- Spider-Man
	- Spyro
	- Star Wars
	- Street Fighter
	- Super Smash Bros.
	- Tekken
	- The Elder Scrolls
	- The King of Fighters
	- The Last of Us
	- The Legend of Zelda
	- The Walking Dead
	- The Witcher
	- Tomb Raider
	- Total War
	- Uncharted
	- Wolfenstein

   (8) Por último, Copilot examinó todas las respuestas de los participantes sobre las ocupaciones que desempeñan a nivel profesional y se le asignó un código que correspondía a la 
       Clasificación Nacional de Ocupaciones 2011 (CNO2011):

	1. Directores y Gerentes
	2. Técnicos y profesionales científicos e intelectuales
	3. Técnicos; profesionales de apoyo
	4. Empleados contables, administrativos y otros empleados de oficina
	5. Trabajadores de los servicios de restauración, personales, protección
	   y vendedores
	6. Trabajadores cualificados en el sector agrícola, ganadero, forestal y
	   pesquero
	7. Artesanos y trabajadores cualificados de las industrias manufacture-
	   ras y la construcción (excepto operadores de instalaciones y maquinaria)
	8. Operadores de instalaciones y maquinaria, y montadores
	9. Ocupaciones elementales

       Se priorizó la ocupación con el nivel jerárquico superior entre de todas las mencionadas por cada participante.


   En cuanto al conjunto de datos brutos del archivo NORPOL_dataset_brutos_2024.csv, se llevó a cabo un procesamiento básico con el fin de facilitar la comprensión de los datos:

   (1) Se reorganizaron las variables y se eliminaron aquellas que eran irrelevantes o tenían información duplicada.

   (2) Se corrigió el intercambio de nombres entre las variables D7_POBLACION y D7_CP, lo que provocaba una asignación incorrecta de valores. Asimismo, se subsanaron errores en los códigos 
       municipales y se eliminaron códigos postales inexistentes.

   (3) Se recodificaron determinadas variables para unificar el valor 0 como etiqueta asociada a la respuesta negativa "No".

   (4) Se recodificó la inversión de los códigos en P3_2 para que "Sí" fuese 1 y "No" fuese 0.


3. Información específica del instrumento o software necesario para interpretar/reproducir los datos, por favor indique su ubicación:

   El conjunto de datos principal fue procesado y guardado en formato CSV. Las etiquetas de variables y valores están disponibles en el archivo NORPOL_libro_de_códigos_2024.pdf


4. Estándares e información sobre calibración, si corresponde:

   No aplica.


5. Condiciones ambientales/experimentales:

   No aplica.


6. Describa cualquier procedimiento de aseguramiento de la calidad realizado sobre los datos:




7. Personas involucradas en la recolección, procesamiento, análisis y/o envío de la muestra, por favor especifique usando los roles de CREDIT \[[https://credit.niso.org/](https://credit.niso.org/)]:

   Luis Miguel Miller Moya – Dirección del proyecto, supervisión
   Isabel Rodríguez Marín – Supervisión del trabajo de campo
   Juan Vicente Castellanos – Supervisión del trabajo de campo


8. Información de contacto del autor:

   Luis Miller
   Instituto de Políticas y Bienes Públicos (IPP)
   luis.miller@.csic.es



INFORMACIÓN ESPECÍFICA DE LOS DATOS

1. Número de variables:

   222 en los datos brutos del archivo NORPOL_dataset_brutos_2024.csv

   218 variables tras limpiar los datos en el archivo NORPOL_dataset_limpios_2024.csv    


2. Número de casos/filas:

   3015


3. Lista de variables:

   La lista completa de variables está disponible en el archivo NORPOL_libro_de_códigos_2024.pdf


4. Códigos de datos perdidos:

   Las celdas con las siglas NA (Not Available) deben interpretarse como valores perdidos.


5. Formatos especializados u otras abreviaturas utilizadas:

   EGB = Educación General Básica
   ESO = Educación Secundaria Obligatoria
   COU = Curso de Orientación Universitaria
   BUP = Bachillerato Unificado y Polivalente
   CCAA = Comunidades Autónomas


6. Diccionarios/libros de códigos utilizados:

   Todos los códigos empleados se encuentran en el archivo NORPOL_libro_de_códigos_2024.pdf, incluyendo los códigos de la Clasificación Nacional de Ocupaciones 2011 (CNO2011) para P6.3


7. Vocabularios controlados/ontologías utilizadas:

   No se usaron vocabularios controlados/ontologías.


