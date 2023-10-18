const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const opacityRange = document.getElementById('opacityRange');
const SizeViewRange = document.getElementById('SizeViewRange');
const SmoothViewRange = document.getElementById('SmoothViewRange');

ctx.globalCompositeOperation = 'destination-over';
ctx.globalAlpha = 1;
// var canvasWidth = canvas.offsetWidth; 
// var canvasHeight = canvas.offsetHeight; 

canvas.width = 1400;
canvas.height = 1000;

var sides_map = {
  "left-left":{},
  "right-right":2,
  "front-front":3,
  "back-back":4,
  "left-front":5,
  "left-back":6,
  "right-front":7,
  "right-back":8
}

var sizablePolygons = [];
var polygons = [];

const bgImage = document.getElementById('backgroundImage');
bgImage.src = '../example_of_segmentation/vw-polo-5-rest-reglament-to-thumb.jpg';
bgImage.onload = function() {
  canvas.width = bgImage.width;
  canvas.height = bgImage.height;
}

function drawBackground() {
  ctx.drawImage(bgImage, 0, 0); 
}

document.getElementById('fileInput').onchange = function() {
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {

    const obj = event.target.result;
    let fileObjectsArray = parseNewFile(JSON.parse(obj));

    parsePoligons(fileObjectsArray);
    sizablePolygons = deepCopy(polygons);

    console.log(find_what_side());
    
    drawPolygons();
  };

  reader.readAsText(file);
};

document.getElementById('opacityRange').onchange = function() {
  drawPolygons();
};

document.getElementById('SizeViewRange').onchange = function() {
  drawPolygons();
};

document.getElementById('SmoothViewRange').onchange = function() {
  setSmoothPolygons();
  drawPolygons();
};

window.onload = function() {

  function isPointInPolygon(point, polygon) {
    const x = point.x ;
    const y = point.y ;

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
    let countOfSelected = 0;
    sizablePolygons.forEach((polygon) => {
      const isInside = isPointInPolygon({ x: mouseX , y: mouseY  }, polygon);
      polygon.isSelected = isInside;
      if(isInside){countOfSelected++;}
    });

    if(countOfSelected>1){
      var smallest = null;
      sizablePolygons.forEach((polygon) => {
          if(polygon.isSelected){
            if(smallest == null){
              smallest = polygon.area;
            }else if(polygon.area < smallest){
              sizablePolygons.find((element)=> element.area === smallest).isSelected = false;
              smallest = polygon.area;
            }else{
              polygon.isSelected = false;
            }
          }
      });
    }
  }

  function handleMousemove(event) {
      const mouseX = event.clientX - canvas.getBoundingClientRect().left;
      const mouseY = event.clientY - canvas.getBoundingClientRect().top;
      
      choosePolygon(mouseX, mouseY);
      drawPolygons();
  }

  canvas.addEventListener('mousemove', handleMousemove);
  handleMousemove({ clientX: 0, clientY: 0 });
}

function find_what_side(){

}

function setSmoothPolygons(){
  if(sizablePolygons.length > 0){

    let smoothView = parseFloat(SmoothViewRange.value);

    sizablePolygons.forEach((polygon)=>{

      const oldPoints = polygons.find((element) => element.name === polygon.name && element.color === polygon.color).points;

      let points = simplify(oldPoints, smoothView, true);

      polygon.points = points;
    });

  }
}

function setSizablePolygons(data){
  if(data.length > 0){

    let sizeView = parseFloat(SizeViewRange.value);
    let allArea = (canvas.width * canvas.height)/100;

    if(sizeView < 9){
      for(let poly of data){
        let percentageOfArea = poly.area/allArea;
        if(percentageOfArea <= sizeView) {
          poly.display = true;
        }else{
          poly.display = false;
        }
      }
    }else{
      data.forEach((poly)=>{poly.display=true});
    }
    data = sortByArea(data);
  }
}

function Polygon(name, color, points){
  this.name = name;
  this.color = color;
  this.points = points;
  this.isSelected = false;
  this.display = true;
  this.area = findArea(points);
}

function sortByArea(polygonList) {
  return polygonList.sort(function(a,b) { return b.area - a.area;});
}

function setPoligons(data, arrToSet){
  arrToSet.length = 0;
  let smoothView = parseFloat(SmoothViewRange.value);

    let coordinates_arr = value.points;
    let color = value.color;
    let name = value.name;
}

function parsePoligons(data){
  polygons.length = 0;

  for (const value of data) {

  // const value = data[9];

    let coordinates_arr = value.coordinates;
    let color = getRandomColor();

    let name = value.name;

    let poly = new Polygon(name, color, coordinates_arr);
    
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

function drawPolygons() {
  const opacity = parseFloat(opacityRange.value);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(); 

  setSizablePolygons(sizablePolygons);
  for (const polygon of sizablePolygons) {
    if(polygon.display){
      ctx.fillStyle = polygon.color;
      ctx.beginPath();
      
      ctx.fillStyle = polygon.isSelected ? 'red' : polygon.color;
      ctx.globalAlpha = polygon.isSelected ? 1 : opacity;
      for (const point of polygon.points) {
          const xPos = point["x"] * canvas.width;
          const yPos = point["y"] * canvas.height;
          ctx.lineTo(xPos, yPos);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function parseNewFile(inputString) {
  const objects = [];
  // let currentObject = null;

  console.log(inputString["mask"]);

  inputString["mask"].forEach((item) => {
    if(item.Points.length > 3){
      let currentObject = null;
      let name = item["Part_Name"];
      let coordinates = [];
      item["Points"].forEach((point) =>{
        let x = point[0];
        let y = point[1];
        coordinates.push({ x, y });
      });
      
      currentObject = { name, coordinates };
      
      objects.push(currentObject);
      }
  });
  return objects;
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

function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const copyArr = [];
    for (let i = 0; i < obj.length; i++) {
      copyArr[i] = deepCopy(obj[i]);
    }
    return copyArr;
  }

  const copyObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      copyObj[key] = deepCopy(obj[key]);
    }
  }
  return copyObj;
}