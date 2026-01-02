import { useState, memo } from "react";
import { Info } from "lucide-react";
import Modal from "./Modal";

const cocoClasses = [
  "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
  "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse",
  "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase",
  "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard",
  "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana",
  "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch",
  "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone",
  "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear",
  "hair drier", "toothbrush"
];

// แยก component สำหรับ list ใหญ่และ memo กัน re-render
const CocoList = memo(() => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
    {cocoClasses.map((c, i) => (
      <div key={i} className="text-sm text-gray-700">
        {i + 1}. {c}
      </div>
    ))}
  </div>
));

export function ModeSelector({ mode, setMode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    { label: "เฉพาะวัตถุเด่น", value: "object", description: "เหมาะสำหรับภาพที่เน้นสิ่งของหรือสิ่งมีชีวิตที่เด่นชัด", type: "yolo" },
    { label: "บรรยายทั้งหมดในภาพ", value: "full", description: "ให้คำบรรยายครบทั้งฉาก รายละเอียดในภาพทุกส่วน", type: "blip" },
  ];

  const handleInfoClick = (opt) => {
    setSelectedOption(opt);
    setIsModalOpen(true);
  };

  const renderModalContent = () => {
    if (!selectedOption) return null;

    if (selectedOption.type === "yolo") {
      return (
        <div className="space-y-3">
          <p><strong>โมเดลที่ใช้:</strong> YOLOv8s (yolov8s.pt)</p>
          <p><strong>สามารถตรวจจับได้:</strong></p>
          <CocoList />
          <p className="pt-2">
            <strong>เครดิตโมเดล:</strong><br />
            พัฒนาโดย Ultralytics<br />
            ใช้โมเดล Pre-trained บน COCO Dataset และนำมาเทรนเองบางส่วน
          </p>
        </div>
      );
    }

    if (selectedOption.type === "blip") {
      return (
        <div className="space-y-3">
          <p><strong>โมเดลที่ใช้:</strong> BLIP (Bootstrapping Language-Image Pre-training)</p>
          <p><strong>สามารถทำอะไรได้บ้าง:</strong></p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>สร้างคำบรรยายภาพ (Image Captioning) แบบครบถ้วน</li>
            <li>วิเคราะห์วัตถุหลัก, ฉากหลัง, บริบทของภาพ</li>
            <li>รองรับการบรรยายหลายบรรทัด</li>
          </ul>
          <p>
            <strong>เครดิตโมเดล:</strong><br />
            พัฒนาโดย Salesforce Research<br />
            ใช้เวอร์ชัน Pre-trained บนชุดข้อมูลขนาดใหญ่ เช่น COCO, Visual Genome
          </p>
        </div>
      );
    }
  };

  return (
    <>
      <fieldset className="mb-6 p-4 sm:p-6 border border-gray-300 rounded-2xl shadow-sm bg-white">
        <legend className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          โหมดวิเคราะห์ภาพ
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition
                ${mode === opt.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"}`}
            >
              <input
                type="radio"
                value={opt.value}
                checked={mode === opt.value}
                onChange={(e) => setMode(e.target.value)}
                className="mt-1.5 h-4 w-4 text-blue-600 shrink-0"
              />
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm sm:text-base font-semibold text-gray-800">{opt.label}</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleInfoClick(opt); }}
                    className="text-gray-400 hover:text-blue-500 transition shrink-0 cursor-pointer"
                  >
                    <Info size={18} />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-500">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedOption?.label}
          variant="alert"
        >
          <div className="prose prose-sm max-h-[70vh] overflow-y-auto">
            {renderModalContent()}
          </div>
        </Modal>
      )}
    </>
  );
}
