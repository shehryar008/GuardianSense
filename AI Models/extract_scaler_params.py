"""Extract mean and scale values from the scaler ONNX model."""
import onnx
import numpy as np
import json
import os

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
scaler_path = os.path.join(PROJECT_ROOT, "Evaluation_Results", "scaler.onnx")

print(f"Loading scaler from: {scaler_path}")
print(f"File size: {os.path.getsize(scaler_path)} bytes")

model = onnx.load(scaler_path)

print(f"\nModel IR version: {model.ir_version}")
print(f"Opset imports: {[(o.domain, o.version) for o in model.opset_import]}")
print(f"Graph name: {model.graph.name}")

print(f"\nInputs:")
for inp in model.graph.input:
    print(f"  {inp.name}: {inp.type}")

print(f"\nOutputs:")
for out in model.graph.output:
    print(f"  {out.name}: {out.type}")

print(f"\nNodes ({len(model.graph.node)}):")
for node in model.graph.node:
    print(f"  {node.op_type}: {node.input} -> {node.output}")

print(f"\nInitializers ({len(model.graph.initializer)}):")
for init in model.graph.initializer:
    arr = np.frombuffer(init.raw_data, dtype=np.float32) if init.raw_data else onnx.numpy_helper.to_array(init)
    print(f"  {init.name}: shape={list(init.dims)}, dtype={init.data_type}, values={arr.tolist()[:5]}...")

# Try to extract mean and scale
mean_values = None
scale_values = None
for init in model.graph.initializer:
    arr = onnx.numpy_helper.to_array(init)
    if "offset" in init.name.lower() or "mean" in init.name.lower():
        mean_values = arr.tolist()
        print(f"\n  MEAN found in '{init.name}': {arr.tolist()}")
    elif "scale" in init.name.lower():
        scale_values = arr.tolist()
        print(f"\n  SCALE found in '{init.name}': {arr.tolist()}")

# If not found by name, just print all
if mean_values is None or scale_values is None:
    print("\nCould not identify mean/scale by name. Dumping all initializers:")
    for init in model.graph.initializer:
        arr = onnx.numpy_helper.to_array(init)
        print(f"  {init.name} = {arr.tolist()}")
