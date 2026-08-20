import os
import json
import yaml

# 1. Define your extracted folder name
DATASET_DIR = r"C:\Users\anura\OneDrive\Desktop\Ellipse\taco_dataset" 

# 2. Your 5-Class Mapping
# The script will print the original dataset categories to your terminal. 
# Look at that printout, then update this dictionary with the correct IDs.
# The Definitive Ellipse 5-Tier Taxonomy Mapping
CLASS_MAPPING = {
    # ID 0 is a Roboflow dataset artifact. We'll dump it to 0.
    0: 0, 

    # --- 0: RECYCLABLES (Plastics, Glass, Metals, Clean Paper/Cardboard) ---
    2: 0, 3: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 
    16: 0, 17: 0, 18: 0, 21: 0, 22: 0, 23: 0, 24: 0, 25: 0, 26: 0, 27: 0, 
    28: 0, 29: 0, 30: 0, 31: 0, 32: 0, 33: 0, 34: 0, 35: 0, 36: 0, 37: 0, 
    38: 0, 39: 0, 40: 0, 41: 0, 42: 0, 43: 0, 44: 0, 45: 0, 46: 0, 50: 0, 
    51: 0, 52: 0, 53: 0, 54: 0, 56: 0, 57: 0, 59: 0,

    # --- 1: ORGANIC (Food waste, soiled tissues) ---
    19: 1, 55: 1, 

    # --- 2: C&D (Construction, broken glass, ropes, heavy scrap metal) ---
    5: 2, 47: 2, 48: 2, 

    # --- 3: HAZARDOUS (Batteries, e-waste, aerosols, cigarettes) ---
    1: 3, 4: 3, 7: 3, 

    # --- 4: BULK DUMP (Garbage bags, unlabeled piles, stray shoes) ---
    20: 4, 49: 4, 58: 4 
}

def process_coco_to_yolo():
    print("Starting conversion and class mapping...")
    
    for split in ['train', 'valid', 'test']:
        split_dir = os.path.join(DATASET_DIR, split)
        json_file = os.path.join(split_dir, '_annotations.coco.json')
        
        if not os.path.exists(json_file):
            continue
            
        with open(json_file, 'r') as f:
            data = json.load(f)
            
        # Print original categories so you know what IDs to map
        if split == 'train':
            print("--- ORIGINAL CATEGORIES FOUND ---")
            for cat in data['categories']:
                print(f"ID {cat['id']}: {cat['name']}")
            print("---------------------------------")

        # Map annotations to their respective images
        anns_by_img = {}
        for ann in data['annotations']:
            img_id = ann['image_id']
            if img_id not in anns_by_img:
                anns_by_img[img_id] = []
            anns_by_img[img_id].append(ann)
            
        # Convert polygons to YOLO .txt format
        for img in data['images']:
            txt_path = os.path.join(split_dir, os.path.splitext(img['file_name'])[0] + '.txt')
            with open(txt_path, 'w') as out_f:
                if img['id'] in anns_by_img:
                    for ann in anns_by_img[img['id']]:
                        old_cat = ann['category_id']
                        # Any ID you forgot to map defaults to 0
                        new_cat = CLASS_MAPPING.get(old_cat, 0) 
                        
                        if 'segmentation' in ann and len(ann['segmentation']) > 0:
                            for seg in ann['segmentation']:
                                line = f"{new_cat}"
                                # Convert coordinates to YOLO's normalized format
                                for i in range(0, len(seg), 2):
                                    x_norm = seg[i] / img['width']
                                    y_norm = seg[i+1] / img['height']
                                    line += f" {x_norm:.6f} {y_norm:.6f}"
                                out_f.write(line + '\n')
                                
        print(f"Converted {split} folder.")

    # Generate the final YOLO data.yaml file
    yaml_path = os.path.join(DATASET_DIR, 'data.yaml')
    yaml_data = {
        'train': './train',
        'val': './valid',
        'test': './test',
        'nc': 5,
        'names': ['Recyclables', 'Organic', 'C_and_D', 'Hazardous', 'Bulk_Dump']
    }
    with open(yaml_path, 'w') as f:
        yaml.dump(yaml_data, f, default_flow_style=False)
    print("Generated data.yaml. Your dataset is ready for YOLO11!")

if __name__ == "__main__":
    process_coco_to_yolo()