from ultralytics import YOLO

yolo_model = YOLO("yolov8s.pt")

def detect_object(image):
    results = yolo_model(image)[0]
    if len(results.boxes) == 0:
        return None
    best_box = max(results.boxes, key=lambda b: b.conf.cpu().item())
    return yolo_model.model.names[int(best_box.cls.cpu().item())]
