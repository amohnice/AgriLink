import { useState } from "react";
import { getPredictedPrice } from "../ai";

const PricePredictor = () => {
  const [crop, setCrop] = useState("");
  const [supply, setSupply] = useState("");
  const [demand, setDemand] = useState("");
  const [predictedPrice, setPredictedPrice] = useState(null);

  const handlePredict = async () => {
    if (!crop || !supply || !demand) return;
    const price = await getPredictedPrice(crop, parseInt(supply), parseInt(demand));
    setPredictedPrice(price);
  };

  return (
    <div>
      <h3>AI Price Prediction</h3>
      <input type="text" placeholder="Crop" value={crop} onChange={(e) => setCrop(e.target.value)} />
      <input type="number" placeholder="Supply" value={supply} onChange={(e) => setSupply(e.target.value)} />
      <input type="number" placeholder="Demand" value={demand} onChange={(e) => setDemand(e.target.value)} />
      <button onClick={handlePredict}>Predict Price</button>
      {predictedPrice && <p>Predicted Price: KES {predictedPrice.toFixed(2)}</p>}
    </div>
  );
};

export default PricePredictor;
