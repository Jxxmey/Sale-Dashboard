from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional
import pandas as pd
import numpy as np
import shutil
import os
import re

router = APIRouter(
    prefix="/api",
    tags=["Sales"]
)

FILES = {
    "thismonth": "thismonth.csv",
    "lastmonth": "lastmonth.csv",
    "lastyear": "lastyear.csv",
    "target": "target.csv"
}

def get_filepath(period: str):
    if period not in FILES:
        raise HTTPException(status_code=404, detail="รองรับแค่ thismonth, lastmonth, lastyear, target")
    return FILES[period]

def clean_id(id_series):
    return id_series.astype(str).str.replace(',', '', regex=False).str.strip().str.replace(r'\.0$', '', regex=True)

@router.post("/upload/{period}")
async def upload_file(period: str, file: UploadFile = File(...)):
    filepath = get_filepath(period)
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"status": "success", "message": f"อัปโหลดไฟล์ {period} สำเร็จ"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการบันทึกไฟล์: {str(e)}")

# ==========================================
# 1. API สรุปยอดขายหลัก (รายบุคคล)
# ==========================================
@router.get("/summary/{period}")
def get_sales_summary(period: str, date: Optional[str] = None):
    filepath = get_filepath(period)
    if not os.path.exists(filepath): return []
    try:
        if not os.path.exists("employee.csv"): return []
        emp_df = pd.read_csv("employee.csv", sep=None, engine='python')
        emp_df.columns = emp_df.columns.str.strip()
        if 'Position' in emp_df.columns and 'ID' in emp_df.columns:
            emp_df['ID'] = clean_id(emp_df['ID'])
            pia_employees = emp_df[emp_df['Position'].astype(str).str.strip().str.upper() == 'PIA']
            pia_ids = pia_employees['ID'].tolist()
        else: return []
            
        df = pd.read_csv(filepath, sep=None, engine='python')
        df.columns = df.columns.str.strip()

        if date and 'Doc Date' in df.columns:
            def convert_to_standard_date(doc_date_str):
                match = re.search(r'(\d{2})/(\d{2})/(\d{4})', str(doc_date_str))
                if match:
                    d, m, y = match.groups()
                    y_int = int(y)
                    if y_int > 2500: y_int -= 543
                    return f"{y_int:04d}-{m}-{d}"
                return ""
            df['Parsed_Date'] = df['Doc Date'].apply(convert_to_standard_date)
            df = df[df['Parsed_Date'] == date]
            if df.empty: return []
        
        officer_id_col = next((c for c in ['Officer (ID)', 'Officer (Code)', 'Officer Code', 'ID'] if c in df.columns), None)
        if 'Officer (Name)' not in df.columns or not officer_id_col: return []
            
        df = df.dropna(subset=['Officer (Name)', officer_id_col])
        df[officer_id_col] = clean_id(df[officer_id_col])
        df = df[df[officer_id_col].isin(pia_ids)]
        if df.empty: return [] 
        
        df['ราคาขายตามบิล'] = pd.to_numeric(df['ราคาขายตามบิล'].astype(str).str.replace(r'[^\d.-]', '', regex=True), errors='coerce').fillna(0)
        df['Number'] = pd.to_numeric(df['Number'].astype(str).str.replace(r'[^\d.-]', '', regex=True), errors='coerce').fillna(0)
        df['Category (Name)'] = df['Category (Name)'].fillna('').astype(str).str.strip().str.upper()
        df['Product (Code)'] = df['Product (Code)'].fillna('').astype(str).str.strip().str.upper() if 'Product (Code)' in df.columns else ''
        df['Brand'] = df['Brand'].fillna('').astype(str).str.strip().str.upper()
        df['Customer (Code)'] = df['Customer (Code)'].fillna('').astype(str).str.strip()
        df['Sub Category'] = df['Sub Category'].fillna('').astype(str).str.strip().str.upper() if 'Sub Category' in df.columns else ''

        def assign_category(row):
            cat, prod_code, brand = row['Category (Name)'], row['Product (Code)'], row['Brand']
            smile_products = ["COVERPLUS1007", "COVERPLUS2007", "COVERPLUS3007", "COVERPLUS1001", "COVERPLUS2001", "COVERPLUS3001", "COVERPLUS1003", "COVERPLUS2003", "COVERPLUS3003", "COVERPLUS1002", "COVERPLUS2002", "COVERPLUS3002", "COVERPLUS1004", "COVERPLUS2004", "COVERPLUS3004", "COVERPLUS1005", "COVERPLUS2005", "COVERPLUS3005"]
            if prod_code in smile_products: return "Cover+"
            if cat == "PROMO OPERATOR": return "Sim"
            if cat == "MAC": return "Mac"
            if cat == "IPAD": return "iPad"
            if cat == "IPHONE": return "iPhone"
            if cat == "APPLE WATCH": return "Apple Watch"
            if brand in ["QPLUS", "BLUEBOX", "TITANV", "BEASUS", "BASEUS", "TECHPRO"]: return "PVL"
            if brand == "APPLE": return "ABA"
            return "3RD"

        df['Grouped_Cat'] = df.apply(assign_category, axis=1)
        df['Calculate_Value'] = np.where(df['Grouped_Cat'].isin(['Cover+', 'Sim']), df['Number'], df['ราคาขายตามบิล'])

        iphone18_mask = df['Sub Category'].isin(['IPHONE 18 PRO', 'IPHONE 18 PRO MAX'])
        iphone18_df = df[iphone18_mask].copy()
        iphone18_sales = iphone18_df.groupby([officer_id_col, 'Officer (Name)'])['Calculate_Value'].sum().reset_index()
        iphone18_sales.rename(columns={'Calculate_Value': 'iPhone_18'}, inplace=True)

        sales_pivot = pd.pivot_table(df, values='Calculate_Value', index=[officer_id_col, 'Officer (Name)'], columns='Grouped_Cat', aggfunc='sum', fill_value=0).reset_index()

        ufund_mask = df['Customer (Code)'].str.contains("UFUND", case=False, na=False)
        ufund_df = df[ufund_mask].copy()
        if 'ID' in ufund_df.columns: ufund_df = ufund_df.drop_duplicates(subset=['ID'])
        elif 'Doc No' in ufund_df.columns: ufund_df = ufund_df.drop_duplicates(subset=['Doc No'])
        ufund_counts = ufund_df.groupby([officer_id_col, 'Officer (Name)'])['Number'].sum().reset_index()
        ufund_counts.rename(columns={'Number': 'UFUND PERSONAL'}, inplace=True)

        # Merge ทุกอย่าง
        final_df = pd.merge(sales_pivot, ufund_counts, on=[officer_id_col, 'Officer (Name)'], how='left')
        final_df = pd.merge(final_df, iphone18_sales, on=[officer_id_col, 'Officer (Name)'], how='left')
        final_df['UFUND PERSONAL'] = final_df['UFUND PERSONAL'].fillna(0).astype(int)
        final_df['iPhone_18'] = final_df['iPhone_18'].fillna(0)

        for col in ["Mac", "iPad", "iPhone", "Apple Watch", "Cover+", "Sim", "ABA", "3RD", "PVL"]:
            if col not in final_df.columns: final_df[col] = 0

        final_df.rename(columns={'Officer (Name)': 'OfficerName', officer_id_col: 'OfficerID'}, inplace=True)

        if os.path.exists("target.csv"):
            try:
                tdf = pd.read_csv("target.csv", sep='\t') if len(pd.read_csv("target.csv", sep='\t').columns) >= 5 else pd.read_csv("target.csv", sep=',')
                tdf.columns = tdf.columns.astype(str).str.replace('"', '').str.strip()
                id_col = next((c for c in tdf.columns if str(c).upper().strip() == 'ID'), None)
                if id_col:
                    tdf[id_col] = clean_id(tdf[id_col])
                    target_mapping = {'TOTAL': 'Target_Total', 'MAC': 'Target_Mac', 'IPAD': 'Target_iPad', 'IPHONE': 'Target_iPhone', 'APPLE WATCH': 'Target_AppleWatch', 'SIM': 'Target_Sim', 'BTB(APPLE)': 'Target_ABA', 'BTB': 'Target_3RD'}
                    upper_cols = {str(c).upper().strip(): c for c in tdf.columns}
                    for original_upper, new_col in target_mapping.items():
                        if original_upper in upper_cols:
                            match_col = upper_cols[original_upper]
                            tdf[match_col] = pd.to_numeric(tdf[match_col].astype(str).str.replace(',', '').str.replace('-', '0').str.replace(r'[^\d.-]', '', regex=True), errors='coerce').fillna(0)
                            tdf = tdf.rename(columns={match_col: new_col})
                    merge_cols = [id_col] + [v for v in target_mapping.values() if v in tdf.columns]
                    final_df = pd.merge(final_df, tdf[merge_cols], left_on='OfficerID', right_on=id_col, how='left')
                    for v in target_mapping.values():
                        if v in final_df.columns: final_df[v] = final_df[v].fillna(0)
            except Exception as e: print(f"[X] Target Error: {e}")

        return final_df.to_dict(orient="records")
    except Exception as e: return []

# ==========================================
# 🌟 2. API สรุป PC (อัปเดตเพิ่ม RTB)
# ==========================================
@router.get("/summary/pc/{period}")
def get_pc_summary(period: str, date: Optional[str] = None):
    filepath = get_filepath(period)
    if not os.path.exists(filepath): return []
    try:
        df = pd.read_csv(filepath, sep=None, engine='python')
        df.columns = df.columns.str.strip()

        df['ราคาขายตามบิล'] = pd.to_numeric(df['ราคาขายตามบิล'].astype(str).str.replace(r'[^\d.-]', '', regex=True), errors='coerce').fillna(0)
        df['Number'] = pd.to_numeric(df['Number'].astype(str).str.replace(r'[^\d.-]', '', regex=True), errors='coerce').fillna(0)
        
        df['Category (Name)'] = df['Category (Name)'].fillna('').astype(str).str.strip().str.upper()
        df['Brand'] = df['Brand'].fillna('').astype(str).str.strip().str.upper()

        def clean_brand(b):
            return str(b).upper().replace(' ', '')
            
        df['Clean_Brand'] = df['Brand'].apply(clean_brand)
        
        # 🌟 เพิ่มค่าย RTB และแบรนด์ Uniq, Enegia, B&O
        pc_mapping = {
            'AMAZINGTHING': 'Maitreechit', 'LAUT': 'Maitreechit', 'ENERGIZER': 'Maitreechit', 'AVOCADO': 'Maitreechit',
            'PIXEL': 'DPLUS Together', 'ABLEMEN': 'DPLUS Together', 'WHY': 'DPLUS Together',
            'BLUEBOX': 'PVL', 'TITANV': 'PVL', 'BEASUS': 'PVL', 'BASEUS': 'PVL', 'TECHPRO': 'PVL', 'QPLUS': 'PVL',
            'UNIQ': 'RTB', 'ENEGIA': 'RTB', 'ENERGEA': 'RTB', 'B&O': 'RTB', 'BANG&OLUFSEN': 'RTB'
        }
        
        brand_standard = {
            'AMAZINGTHING': 'Amazingthing', 'LAUT': 'Laut', 'ENERGIZER': 'Energizer', 'AVOCADO': 'Avocado',
            'PIXEL': 'Pixel', 'ABLEMEN': 'Ablemen', 'WHY': 'Why',
            'BLUEBOX': 'Blue Box', 'TITANV': 'TitanV', 'BEASUS': 'Baseus', 'BASEUS': 'Baseus', 'TECHPRO': 'Techpro', 'QPLUS': 'Qplus',
            'UNIQ': 'Uniq', 'ENEGIA': 'Enegia', 'ENERGEA': 'Enegia', 'B&O': 'B&O', 'BANG&OLUFSEN': 'B&O'
        }

        df['Company'] = df['Clean_Brand'].map(pc_mapping)
        df['Std_Brand'] = df['Clean_Brand'].map(brand_standard)
        
        pc_df = df.dropna(subset=['Company'])
        if pc_df.empty: return []
            
        summary = pc_df.groupby(['Company', 'Std_Brand'])['ราคาขายตามบิล'].sum().reset_index()
        summary.rename(columns={'ราคาขายตามบิล': 'Sales', 'Std_Brand': 'Brand'}, inplace=True)
        
        return summary.to_dict(orient="records")

    except Exception as e:
        print(f"[X] เกิดข้อผิดพลาดในการดึงข้อมูล PC: {e}")
        return []