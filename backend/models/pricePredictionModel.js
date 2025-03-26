const tf = require("@tensorflow/tfjs");

let model;

const trainModel = async () => {
  const data = [
    [1, 100], [2, 110], [3, 120], [4, 125],
    [5, 130], [6, 140], [7, 145], [8, 150]
  ];

  const xs = tf.tensor2d(data.map(d => [d[0]]));
  const ys = tf.tensor2d(data.map(d => [d[1]]));

  model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ optimizer: "sgd", loss: "meanSquaredError" });

  await model.fit(xs, ys, { epochs: 500 });
  console.log("Model trained successfully!");
};

const predictPrice = async (month) => {
  if (!model) await trainModel();
  const prediction = model.predict(tf.tensor2d([[month]]));
  return prediction.dataSync()[0];
};

module.exports = { trainModel, predictPrice };
