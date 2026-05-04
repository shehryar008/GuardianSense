import pandas as pd
import numpy as np

df = pd.read_csv('gps_dataset/general_table_uncontrolled_test.csv')
print('=== Column counts ===')
print(df.count())
print()

cols = ['speed','accx','accy','accz','gyrox','gyroy','gyroz']
tr = pd.to_numeric(df['type_record'], errors='coerce').fillna(0).astype(int)

# Check how many crash rows have valid sensor data
for col in cols:
    vals = pd.to_numeric(df[col], errors='coerce')
    normal_valid = vals[tr == 0].notna().sum()
    crash_valid = vals[tr >= 1].notna().sum()
    n_crash = (tr >= 1).sum()
    print(f'{col}: crash rows with data = {crash_valid}/{n_crash}, normal rows with data = {normal_valid}/{(tr==0).sum()}')
