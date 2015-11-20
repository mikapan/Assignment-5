console.log("Assignment 5");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var map = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLngLat = [-71.088066,42.315520]; //from http://itouchmap.com/latlong.html

var projection = d3.geo.mercator()
    .translate([width/2,height/2])
    .center(bostonLngLat)
    .scale(150000);
    //...

var path = d3.geo.path().projection(projection);

//TODO: create a color scale
var colorScale = d3.scale.linear().domain([0,150000]).range(['white','pink'])

//TODO: create a d3.map() to store the value of median HH income per block group
var rateOfIncome = d3.map();

//TODO: import data, parse, and draw
queue()
.defer(d3.json,"data/bos_census_blk_group.geojson")
.defer(d3.json,"data/bos_neighborhoods.geojson")
.defer(d3.csv,"data/acs2013_median_hh_income.csv", parseData)
.await(function(err, blocks, neighborhoods){

        draw(blocks, neighborhoods);
    })


function parseData(d){
    rateOfIncome.set(d.geoid, {
        'nameBlock': d.name,
        'income': +d.B19013001
    });}


function draw(blocks, neighborhoods){

    map.selectAll('.block-group')
        .attr('class','block-group')
        .data(blocks.features)
        .enter()
        .append('path')
        .attr('d',path)
        .style('fill', function(d){

            var income = rateOfIncome.get(d.properties.geoid).income;
            return colorScale(income);
        })
        .call(attachTooltip);

    map.append('path')
        .datum(neighborhoods)
        .attr('class','boundaries')
        .attr('d',path)
        .style('stroke','white')
        .style('stroke-width','1.5px')
        .style('fill','none');

    map.selectAll('.label')
        .data(neighborhoods.features)
        .enter()
        .append('text')
        .attr('class','label')
        .text(function(d){
            return (d.properties.name);
        })
        .attr('x', function(d){
            return path.centroid[0];
        })
        .attr('y',function(d){
            return path.centroid[1];
        })


    }

    function attachTooltip(selection){
        selection
            .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.transition().style('opacity',1);

            var income = rateOfIncome.get(d.properties.geoid).income;
            tooltip.select('#HHincome').html(income);
        })
            .on('mousemove', function(){
                var xy = d3.mouse(canvas.node());
                var tooltip = d3.select('.custom-tooltip');

                tooltip.style('left',xy[0]+50+'px')
                    .style('top',(xy[1]+50)+'px')
            })
            .on('mouseleave', function(){
                var tooltip = d3.select('.custom-tooltip')
                    tooltip.transition()
                    .style('opacity',0);
            })
    }