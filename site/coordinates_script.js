const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const opacityRange = document.getElementById('opacityRange');
const SizeViewRange = document.getElementById('SizeViewRange');
const container = document.getElementById('container');
canvas.width = 1400;
canvas.height = 1000;

var polygons = [];
var sizablePolygons = [];

document.getElementById('fileInput').onchange = function() {
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const fileText = event.target.result;

    let fileObjectsArray = parseOldFile(fileText);
    parsePoligons(fileObjectsArray);
    setSizablePolygons();
    drawPolygons(sizablePolygons);

  };

  reader.readAsText(file);
};


document.getElementById('opacityRange').onchange = function() {
  drawPolygons(sizablePolygons);
};

function setSizablePolygons(){
  if(polygons.length > 0){
    sizablePolygons.length = 0;
    let sizeView = parseInt(SizeViewRange.value);
    let allArea = (canvas.width * canvas.height)/100;
    switch(sizeView){
      case 0:
        for(let poly of polygons){
          let percentageOfArea = poly.area/allArea;
          if(percentageOfArea < 0.2) {
            sizablePolygons.push(poly);
          }
        }
        break;
      case 1:
        for(let poly of polygons){
          let percentageOfArea = poly.area/allArea;
          if(percentageOfArea > 0.2 && percentageOfArea < 1) {
            sizablePolygons.push(poly);
          }
        }
        break;
      case 2:
        for(let poly of polygons){
          let percentageOfArea = poly.area/allArea;
          if(percentageOfArea > 1 && percentageOfArea < 2) {
            sizablePolygons.push(poly);
          }
        }
        break;
      case 3:
      for(let poly of polygons){
        let percentageOfArea = poly.area/allArea;
          if(percentageOfArea > 2) {
            sizablePolygons.push(poly);
          }
      }
      break;
      case 4:
        for(let poly of polygons){
          sizablePolygons.push(poly);
        }
        break;
    }
    sizablePolygons = sortByKey(sizablePolygons);
  }
}

document.getElementById('SizeViewRange').onchange = function() {
  setSizablePolygons();
  drawPolygons(sizablePolygons);
};



window.onload = function() {

  function isPointInPolygon(point, polygon) {
    const x = point.x * canvas.width;
    const y = point.y * canvas.height;

    let inside = false;
    for (let i = 0, j = polygon.points.length - 1; i < polygon.points.length; j = i++) {
      const xi = polygon.points[i].x * canvas.width;
      const yi = polygon.points[i].y * canvas.height;
      const xj = polygon.points[j].x * canvas.width;
      const yj = polygon.points[j].y * canvas.height;

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }

    return inside;
  }

  function choosePolygon(mouseX, mouseY) {
    sizablePolygons.forEach((polygon) => {
        const isInside = isPointInPolygon({ x: mouseX / canvas.width, y: mouseY / canvas.height }, polygon);
        polygon.isSelected = isInside;
        if(isInside){
          removeObjectWithName(sizablePolygons, polygon.name);
          sizablePolygons.push(polygon);
          return;
        }
      });
  }

  function removeObjectWithName(arr, name) {
    const objWithIdIndex = arr.findIndex((obj) => obj.name === name);

    if (objWithIdIndex > -1) {
      arr.splice(objWithIdIndex, 1);
    }

    return arr;
  }

  function handleMousemove(event) {
      const mouseX = event.clientX - canvas.getBoundingClientRect().left;
      const mouseY = event.clientY - canvas.getBoundingClientRect().top;
      const opacity = parseFloat(opacityRange.value);
      // Loop through polygons and check if the mouse is inside each one

      choosePolygon(mouseX, mouseY);
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Redraw the polygons based on isSelected status
      sizablePolygons.forEach((polygon) => {
        ctx.beginPath();
        ctx.fillStyle = polygon.isSelected ? 'red' : polygon.color;
        ctx.globalAlpha = polygon.isSelected ? 1 : opacity;
        polygon.points.forEach((point, index) => {
          const x = point.x * canvas.width;
          const y = point.y * canvas.height;
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.closePath();
        ctx.fill();
      });
  }

  canvas.addEventListener('mousemove', handleMousemove);
  handleMousemove({ clientX: 0, clientY: 0 });
}

function Polygon(name, color, points){
  this.name = name;
  this.color = color;
  this.points = points;
  this.isSelected = false;
  this.area = findArea(points);
}

function sortByKey(polygonList) {
  return polygonList.sort(function(a,b) { return b.area - a.area;});
}

function parsePoligons(data){
  polygons.length = 0;

  for (const value of data) {

  // const value = data[2];

    let coordinates_arr = value.coordinates;
    let color = getRandomColor();
    let name = value.name;

    poly = new Polygon(name, color, coordinates_arr);
    
    polygons.push(poly);
  }
}



function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function drawPolygons(data) {
    const opacity = parseFloat(opacityRange.value);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // polygonsOldArray = data;

    for (const polygon of data) {

        ctx.fillStyle = polygon.color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        
        for (const point of polygon.points) {
            const xPos = point["x"] * canvas.width;
            const yPos = point["y"] * canvas.height;
            ctx.lineTo(xPos, yPos);
        }
        ctx.closePath();
        ctx.fill();
    }
}


function parseOldFile(inputString) {
  const lines = inputString.split(/(NEXT)/);
  const objects = [];
  let currentObject = null;

  for (const line of lines) {
    if(line.length > 3){
      if (line.substring(line.length - 4) === 'NEXT') {
        if (currentObject) {
          objects.push(currentObject);
        }
        currentObject = null;
      } else {
        const parts = line.split(' ');
        const name = parseInt(parts[0]);
        const coordinates = [];
        for (let i = 1; i < parts.length; i += 2) {
          const x = parseFloat(parts[i]);
          const y = parseFloat(parts[i + 1]);
          coordinates.push({ x, y });
        }
        if (!currentObject) {
          currentObject = { name, coordinates };
        } else {
          currentObject.coordinates = currentObject.coordinates.concat(coordinates);
        }
      }
    }
  }
  if (currentObject) {
    objects.push(currentObject);
  }
  return objects;
}


function findArea(points){
  let averageHeight = 0;
  let averageWidth = 0;
  let averageArea = 0;

  const x = points[0]["x"];
  const y = points[0]["y"];
  points.push({ x, y });

  for(let pointNumber = 0; pointNumber < points.length -1; pointNumber++){
    averageHeight = (points[pointNumber]["y"] + points[pointNumber+1]["y"]) * canvas.height/2;
    averageWidth = (points[pointNumber+1]["x"] - points[pointNumber]["x"]) * canvas.width;
    averageArea += averageHeight * averageWidth;
  }
  return averageArea;
}