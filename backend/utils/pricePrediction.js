const tf = require('@tensorflow/tfjs');
const axios = require('axios');

// Simulated dataset (to be replaced with real market data)
const marketData = [
  { supply: 100, demand: 200, price: 50 },
  { supply: 80, demand: 250, price: 60 },
  { supply: 120, demand: 150, price: 40 },
];

// Train a simple model
const trainModel = async () => {
  const xs = marketData.map(data => [data.supply, data.demand]);
  const ys = marketData.map(data => data.price);

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [2] }));
  model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

  const xsTensor = tf.tensor2d(xs);
  const ysTensor = tf.tensor2d(ys, [ys.length, 1]);

  await model.fit(xsTensor, ysTensor, { epochs: 100 });
  return model;
};

// Predict price based on supply & demand
exports.predictPrice = async (supply, demand) => {
  const model = await trainModel();
  const prediction = model.predict(tf.tensor2d([[supply, demand]])).dataSync();
  return Math.round(prediction[0]);
};
