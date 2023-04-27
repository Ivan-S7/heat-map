// -----------------------------------Creando variables y funciones-----------------------------------------
let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
let req = new XMLHttpRequest();

let baseTemp;
let values;

let xScale;
let yScale;

let minYear;
let maxYear;

let width = 1200
let height = 600
let padding = 60

let canvas = d3.select('#canvas')
canvas.attr('width', width)
canvas.attr('height', height)

let tooltip = d3.select('#tooltip')

let generateScales=()=>{
    // Acá comenzamos a generar nuestra escala para el eje x. Seleccionamos scaleLinear porque trabajaremos con años en numeros enteros. el paso siguiente inmediato es dibujar el eje x, lo que haremos en la función drwaAxes, y es alli donde especificamos que vaya en la parte inferior del svg


    // usaremos estas dos variables para calcular el valor minimo y el valor maximo.
    minYear = d3.min(values, (item) =>{
        return item['year']
    })

    maxYear = d3.max(values, (item)=>{
        return item['year']
    })
    xScale = d3.scaleLinear()
            // El rango se refiere al espacio disponible en la pantalla para dibujar nuestro eje x
            .range([padding, width-padding])

            

            .domain([minYear, maxYear + 1])


    // Acá debemos utilizar scaleTime para poder llevar  la fecha que nos entregan a un string, ya que el producto final tiene el nombre de cada mes en el eje y
    yScale = d3.scaleTime()
                // el valor mas bajo (que es enero) estará en la parte superior del eje y, mientras que el valor mas alto (diciembre) estará en la parte inferior del eje y 
               .range([padding, height-padding])

               .domain([new Date(0,0,0,0,0,0,0), new Date(0,12,0,0,0,0,0)])

}

let drawCells = () =>{

    canvas.selectAll('rect')
        //   Acá unimmos (asociamos) cada rectangulo a un valor dentro de la data disponible.
          .data(values)
        //   El metodo enter es para especificar que queremos hacer con la data.
           
          
          .enter()
          .append('rect')
          .attr('class', 'cell')
        //   Acá cambiamos el color según la variacion de temperatura. Luego de aplicar este codigo aun NO SERÁ VISIBLE, pero al inspeccionar los divs veremos que tienen diferentes colores.
        .attr('fill', (item) => {
            let variance = item['variance']
            if(variance <= -1){
                return 'SteelBlue'
            }else if(variance <= 0){
                return 'LightSteelBlue'
            }else if(variance <= 1){
                return 'Orange'
            }else{
                return 'Crimson'
            }
        })

        .attr('data-year', (item) =>{
            return item['year']
        })
        
        // La data tiene los meses por números (van desde el mes 1 hasta el mes 12); pero en javascript los meses inician en 0 y terminan en 11; por ello, le debemos restar uno a cada mes
        .attr('data-month', (item) =>{
            return item['month'] - 1
        })

        .attr('data-temp', (item) =>{
            return baseTemp + item['variance']
        })
        
        // Acá asignamos el alto de cada rectangulo. Lo calculamos dividiento la altura total disponible del eje y, dividiendola entre los 12 meses
        .attr('height', ((height - 2*padding)/12))

        .attr('width', (item)=>{
            let totalOfYears = maxYear - minYear;
            return ((width -(2*padding))/totalOfYears)
        })

        .attr('x', (item)=>{
            return xScale(item['year'])
        })


        // Acá le daremos un valor al eje y (una coordenada) a cada rectangulo.
        .attr('y', (item) =>{
            return yScale(new Date(0, item['month']-1, 0, 0, 0, 0, 0))
        })

        .on('mouseover', (item) => {
            tooltip.transition()
                .style('visibility', 'visible')
            
            let monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"]
        
            tooltip.text(item['year'] + ' ' + monthNames[item['month'] -1 ] + ' : ' + item['variance'])
            tooltip.attr('data-year', item['year'])
        })
        .on('mouseout', (item) => {
            tooltip.transition()
                .style('visibility', 'hidden')
        })
          

        
}

let drawAxes = () =>{

    // Para dibujar nuestro eje x, seleccionamos axisbottom para especificar que irá en el fondo. Luego necesitamos asignarle un grupo de elementos (g) DENTRO DEL DOCUMENTO SVG, para luego llamar a nuestro eje x. Justo despues de llamar al xAxis, se hara visible en nuestro svg (aunque aún en la parte superior)
    let xAxis = d3.axisBottom(xScale)
                // la 'd' quiere decir 'decimal'. Se utiliza para que el numero se muestre como entero 
                .tickFormat(d3.format('d'))





    // en el caso del eje y, lo queremos del lado izquierdo, por lo que utilizamos axisLeft.
    let yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.timeFormat('%B'))
    
    canvas.append('g')
          .call(xAxis)
          .attr('id', 'x-axis')
        //   Usamos el atributo transform con translate para poder llevar nuestro eje x a la parte inferior del documento svg. el primer argumento es 0 porque no lo queremos mover horizontalmente, mientras que modificamos el segundo para moverlo de forma vertical
        .attr('transform', 'translate(0, ' + (height-padding)+ ')')




    // Para poder dibujar en eje y debemos anexar otro grupo de elementos (g) en nuestro svg; y moverlo según sea necesario.
    canvas.append('g')
          .call(yAxis)
          .attr('id', 'y-axis')
          .attr('transform', 'translate(' + padding + ', 0)')

}

// -------------------------------------------Fetching Data-------------------------------------------------
req.open('GET', url, true)
req.onload = () =>{
    let object = JSON.parse(req.responseText)
    
    values = object['monthlyVariance']
    baseTemp = object['baseTemperature']
    console.log(baseTemp,values)
    generateScales();
    drawCells()
    drawAxes()

}
req.send()