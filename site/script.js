// // Get references to HTML elements
// const canvas = document.getElementById('canvas');
// const ctx = canvas.getContext('2d');
// const image = document.getElementById('image'); // Reference to the image element

// // Load and draw the image on the canvas
// function make_base() {
//   canvas.width = image.width; // Set canvas width to match the image width
//   canvas.height = image.height; // Set canvas height to match the image height
//   ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

//   // Clear the canvas to make it transparent
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   // Your existing code to draw polygons here
// }

// // Event listener for image load
// image.onload = make_base;