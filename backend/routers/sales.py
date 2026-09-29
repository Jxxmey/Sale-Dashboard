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
        
        # 🌟 กลับมาใช้ชื่อคอลัมน์ตรงๆ แบบเดิม (ป้องกันบั๊กยอด 0)
        if 'ราคาขายตามบิล' in df.columns:
            df['ราคาขายตามบิล'] = pd.to_numeric(df['ราคาขายตามบิล'].astype(str).str.replace(r'[^\d.-]', '', regex=True), errors='coerce').fillna(0)
        else:
            df['ราคาขายตามบิล'] = 0

        if 'Number' in df.columns:
            df['Number'] = pd.to_numeric(df['Number'].astype(str).str.replace(r'[^\d.-]', '', regex=True), errors='coerce').fillna(0)
        else:
            df['Number'] = 1

        if 'Product (Code)' in df.columns:
            df['Product (Code)'] = df['Product (Code)'].fillna('').astype(str).str.strip().str.upper()
        else:
            df['Product (Code)'] = ''

        df['Category (Name)'] = df['Category (Name)'].fillna('').astype(str).str.strip().str.upper() if 'Category (Name)' in df.columns else ''
        df['Brand'] = df['Brand'].fillna('').astype(str).str.strip().str.upper() if 'Brand' in df.columns else ''
        df['Customer (Code)'] = df['Customer (Code)'].fillna('').astype(str).str.strip() if 'Customer (Code)' in df.columns else ''
        df['Sub Category'] = df['Sub Category'].fillna('').astype(str).str.strip().str.upper() if 'Sub Category' in df.columns else ''

        def assign_category(row):
            cat = row.get('Category (Name)', '')
            prod_code = row.get('Product (Code)', '')
            brand = row.get('Brand', '')
            sub_cat = row.get('Sub Category', '')
            
            # 🌟 ดักจับ Product (Code) ของ Cover+ ตรงๆ
            smile_products = [
                "COVERPLUS1007", "COVERPLUS2007", "COVERPLUS3007", 
                "COVERPLUS1001", "COVERPLUS2001", "COVERPLUS3001", 
                "COVERPLUS1003", "COVERPLUS2003", "COVERPLUS3003", 
                "COVERPLUS1002", "COVERPLUS2002", "COVERPLUS3002", 
                "COVERPLUS1004", "COVERPLUS2004", "COVERPLUS3004", 
                "COVERPLUS1005", "COVERPLUS2005", "COVERPLUS3005"
            ]
            
            if prod_code in smile_products: 
                return "Cover+"
            
            if cat == "PROMO OPERATOR" or "SIM" in cat or "SIM" in sub_cat: return "Sim"
            if cat == "MAC": return "Mac"
            if cat == "IPAD": return "iPad"
            if cat == "IPHONE": return "iPhone"
            if cat == "APPLE WATCH": return "Apple Watch"
            if brand in ["QPLUS", "BLUEBOX", "TITANV", "BEASUS", "BASEUS", "TECHPRO"]: return "PVL"
            if brand == "APPLE": return "ABA"
            return "3RD"

        df['Grouped_Cat'] = df.apply(assign_category, axis=1)
        
        # Cover+ และ SIM นับจำนวนชิ้น ส่วนอื่นๆ นับเป็นราคาบาท
        df['Calculate_Value'] = np.where(df['Grouped_Cat'].isin(['Cover+', 'Sim']), df['Number'], df['ราคาขายตามบิล'])

        # คำนวณจำนวนเครื่อง iPhone ที่ขายได้
        iphone_mask = df['Grouped_Cat'] == 'iPhone'
        iphone_units_df = df[iphone_mask].groupby([officer_id_col, 'Officer (Name)'])['Number'].sum().reset_index()
        iphone_units_df.rename(columns={'Number': 'iPhone_Units'}, inplace=True)

        # หักยอด iPhone 18
        iphone18_mask = df['Sub Category'].isin(['IPHONE 18 PRO', 'IPHONE 18 PRO MAX'])
        iphone18_df = df[iphone18_mask].copy()
        iphone18_sales = iphone18_df.groupby([officer_id_col, 'Officer (Name)'])['Calculate_Value'].sum().reset_index()
        iphone18_sales.rename(columns={'Calculate_Value': 'iPhone_18'}, inplace=True)

        sales_pivot = pd.pivot_table(df, values='Calculate_Value', index=[officer_id_col, 'Officer (Name)'], columns='Grouped_Cat', aggfunc='sum', fill_value=0).reset_index()

        ufund_counts = pd.DataFrame()
        if 'Customer (Code)' in df.columns:
            ufund_mask = df['Customer (Code)'].str.contains("UFUND", case=False, na=False)
            ufund_df = df[ufund_mask].copy()
            if 'ID' in ufund_df.columns: ufund_df = ufund_df.drop_duplicates(subset=['ID'])
            elif 'Doc No' in ufund_df.columns: ufund_df = ufund_df.drop_duplicates(subset=['Doc No'])
            ufund_counts = ufund_df.groupby([officer_id_col, 'Officer (Name)'])['Number'].sum().reset_index()
            ufund_counts.rename(columns={'Number': 'UFUND PERSONAL'}, inplace=True)

        final_df = pd.merge(sales_pivot, ufund_counts, on=[officer_id_col, 'Officer (Name)'], how='left') if not ufund_counts.empty else sales_pivot.copy()
        if 'UFUND PERSONAL' not in final_df.columns: final_df['UFUND PERSONAL'] = 0

        final_df = pd.merge(final_df, iphone18_sales, on=[officer_id_col, 'Officer (Name)'], how='left')
        final_df = pd.merge(final_df, iphone_units_df, on=[officer_id_col, 'Officer (Name)'], how='left')

        final_df['UFUND PERSONAL'] = final_df['UFUND PERSONAL'].fillna(0).astype(int)
        final_df['iPhone_18'] = final_df['iPhone_18'].fillna(0)
        final_df['iPhone_Units'] = final_df['iPhone_Units'].fillna(0).astype(int)

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
    except Exception as e: 
        print("Exception in summary:", e)
        return []

@router.get("/summary/pc/{period}")
def get_pc_summary(period: str, date: Optional[str] = None):
    filepath = get_filepath(period)
    if not os.path.exists(filepath): return []
    try:
        df = pd.read_csv(filepath, sep=None, engine='python')
        df.columns = df.columns.str.strip()
        
        if 'ราคาขายตามบิล' in df.columns:
            df['ราคาขายตามบิล'] = pd.to_numeric(df['ราคาขายตามบิล'].astype(str).str.replace(r'[^\d.-]', '', regex=True), errors='coerce').fillna(0)
        else:
            df['ราคาขายตามบิล'] = 0
            
        df['Brand'] = df['Brand'].fillna('').astype(str).str.strip().str.upper() if 'Brand' in df.columns else ''
        df['Clean_Brand'] = df['Brand'].apply(lambda b: str(b).upper().replace(' ', ''))
        
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
    except Exception as e: return []