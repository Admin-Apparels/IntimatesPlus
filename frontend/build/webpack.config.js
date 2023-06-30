module.exports = [
  {
    entry: "mat-design.scss",
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".css", ".scss"],
      modules: ["src", "node_modules"], // Assuming that your files are inside the src dir
    },
  },
];
