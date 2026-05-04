import pandas as pd
import numpy as np

df1 = pd.read_csv('gps_dataset/dataset_training/data_set_training.csv')
for c in ['accx','accy','accz','gyrox','gyroy','gyroz']:
    df1[c] = pd.to_numeric(df1[c], errors='coerce').fillna(0)
for axis in ['accx','accy','accz']:
    df1[f'{axis}_linear'] = df1[axis] - df1[axis].ewm(alpha=0.1, adjust=False).mean()

df2 = pd.read_csv('gps_dataset/road_accident_imu_dataset_8000.csv')
df2 = df2.rename(columns={'Acc_X': 'accx', 'Acc_Y': 'accy', 'Acc_Z': 'accz',
                          'Gyro_X': 'gyrox', 'Gyro_Y': 'gyroy', 'Gyro_Z': 'gyroz',
                          'Speed_kmh': 'speed', 'Crash_Label': 'label'})
df2 = df2[df2['label'] == 0].copy()
for axis in ['accx','accy','accz']:
    df2[f'{axis}_linear'] = df2[axis] - df2[axis].ewm(alpha=0.1, adjust=False).mean()

def add_feats(df):
    accx = df["accx_linear"] if "accx_linear" in df.columns else df["accx"]
    accy = df["accy_linear"] if "accy_linear" in df.columns else df["accy"]
    accz = df["accz_linear"] if "accz_linear" in df.columns else df["accz"]
    df["acc_mag"] = np.sqrt(accx**2 + accy**2 + accz.fillna(0)**2)
    df["gyro_mag"] = np.sqrt(df["gyrox"]**2 + df["gyroy"]**2 + df["gyroz"]**2)
    df["jerk_mag"] = df["acc_mag"].diff().fillna(0).abs()
    df["acc_energy"] = df["acc_mag"].rolling(5, min_periods=1).apply(lambda x: np.sum(x**2), raw=True).fillna(0)
    df["rotational_energy"] = df["gyro_mag"].rolling(5, min_periods=1).apply(lambda x: np.sum(x**2), raw=True).fillna(0)
    return df

df1 = add_feats(df1)
df2 = add_feats(df2)
combined = pd.concat([df1, df2], ignore_index=True)

print("IQR Analysis of Combined Training Data:")
features = ["acc_mag", "gyro_mag", "jerk_mag", "acc_energy", "rotational_energy"]
for f in features:
    q1, q3 = combined[f].quantile(0.25), combined[f].quantile(0.75)
    iqr = q3 - q1
    print(f"{f:18s} Q1={q1:7.3f} Q3={q3:7.3f} IQR={iqr:7.3f} (min={combined[f].min():.3f}, max={combined[f].max():.3f})")

