import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  basePrice: { type: Number, required: true, description: 'Price per KG in base currency' },
  colors: [
    {
      colorName: String,
      surcharge: { type: Number, default: 0 },
    },
  ],
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 0.5 },
  maxStock: { type: Number, default: 10 },
  stockTiers: [
    {
      minStock: { type: Number, description: 'Minimum stock for this tier' },
      maxStock: { type: Number, description: 'Maximum stock for this tier' },
      priceMultiplier: { type: Number, default: 1.0, description: 'Multiplier applied to base price' },
    },
  ],
  description: String,
  density: { type: Number, description: 'Material density in g/cm³' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

materialSchema.methods.calculatePrice = function (colorName, weight) {
  const color = this.colors.find((c) => c.colorName === colorName);
  const colorSurcharge = color ? color.surcharge : 0;
  const tier = this.stockTiers.find((t) => this.stock >= t.minStock && this.stock <= t.maxStock) || this.stockTiers[0] || { priceMultiplier: 1 };
  const pricePerKg = (this.basePrice + colorSurcharge) * tier.priceMultiplier;
  return pricePerKg * weight;
};

export default mongoose.model('Material', materialSchema);