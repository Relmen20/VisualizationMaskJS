
function Polygon(name, color, points){
  this.name = name;
  this.color = color;
  this.points = points;
  this.isSelected = false;
}



function parsePoligons(data){
  polygons.length = 0;

  for (const value of data) {
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



function handleMousemove(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    // Loop through polygons and check if the mouse is inside each one
    polygons.forEach((polygon) => {
      const isInside = isPointInPolygon({ x: mouseX / canvas.width, y: mouseY / canvas.height }, polygon);
      polygon.isSelected = isInside;
    });

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw the polygons based on isSelected status
    polygons.forEach((polygon) => {
      ctx.beginPath();
      ctx.fillStyle = polygon.isSelected ? 'red' : polygon.color;
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