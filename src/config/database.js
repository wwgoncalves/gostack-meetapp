module.exports = {
  dialect: "postgres", // requires packages "pg" and "pg-hstore"
  host: "localhost",
  username: "postgres",
  password: "docker",
  database: "meetapp",
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
