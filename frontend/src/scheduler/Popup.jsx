import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";

function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  let hours12 = hours % 12;
  if (hours12 === 0) hours12 = 12;
  return `${hours12}:${minutes < 10 ? "0" + minutes : minutes} ${period}`;
}

export default function Popup({ isOpen, onClose, courseData, onConfirm }) {
  const [step, setStep] = useState(1);
  const [selectedSection, setSelectedSection] = useState(null);
  const [componentGroups, setComponentGroups] = useState({});
  const [selectedComponents, setSelectedComponents] = useState({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedSection(null);
      setComponentGroups({});
      setSelectedComponents({});
    }
  }, [isOpen, courseData]);

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    const groups = section.components.reduce((acc, comp) => {
      if (comp.type === "LEC") return acc;
      if (!acc[comp.type]) {
        acc[comp.type] = [];
      }
      acc[comp.type].push(comp);
      return acc;
    }, {});
    setComponentGroups(groups);

    const initialSelections = {};
    Object.entries(groups).forEach(([type, comps]) => {
      if (comps.length === 1) {
        initialSelections[type] = comps[0];
      }
    });
    setSelectedComponents(initialSelections);
    setStep(2);
  };

  const handleComponentSelect = (type, component) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [type]: component,
    }));
  };

  const handleConfirm = () => {
    const lecComponents = selectedSection.components.filter((comp) => comp.type === "LEC");
    const finalData = {
      section: selectedSection,
      components: {
        ...selectedComponents,
        ...(lecComponents.length > 0 && { LEC: lecComponents }),
      },
    };
    if (onConfirm) {
      onConfirm(finalData);
    } else {
      console.log("Final course configuration:", finalData);
    }
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="fixed inset-0 flex items-center justify-center z-50"
        onClose={onClose}
      >
        <Dialog.Panel 
          className="bg-white p-6 rounded-lg shadow-md border border-gray-300
                     w-[90%] max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl transition-all
                     max-h-[90vh] overflow-y-auto"
        >
          {step === 1 && (
            <>
              <Dialog.Title className="text-lg md:text-xl font-semibold text-gray-800">
                Select a Section
              </Dialog.Title>
              {courseData && courseData.sections && courseData.sections.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {courseData.sections.map((section, index) => (
                    <button
                      key={index}
                      onClick={() => handleSectionSelect(section)}
                      className="w-full text-left px-4 py-2 border rounded hover:bg-blue-100 transition"
                    >
                      Section {section.sectionID} - {section.instructor}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm md:text-base text-gray-600">
                  No section information available.
                </p>
              )}
              <button 
                onClick={onClose} 
                className="mt-4 w-full md:w-auto px-4 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <Dialog.Title className="text-lg md:text-xl font-semibold text-gray-800">
                Configure Section {selectedSection.sectionID}
              </Dialog.Title>
              <div className="mt-4 space-y-4">
                {Object.keys(componentGroups).length > 0 ? (
                  Object.entries(componentGroups).map(([type, comps]) => (
                    <div key={type}>
                      <p className="font-medium text-gray-700">{type}:</p>
                      <div className="mt-1 space-y-2">
                        {comps.map((comp, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleComponentSelect(type, comp)}
                            className={`w-full text-left px-4 py-2 border rounded transition ${
                              selectedComponents[type] &&
                              selectedComponents[type].ID === comp.ID
                                ? "bg-blue-200 border-blue-400"
                                : "hover:bg-blue-50"
                            }`}
                          >
                            <div className="font-semibold">
                              {type} - {comp.ID}
                            </div>
                            {comp.timeSlots && comp.timeSlots.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {comp.timeSlots.map((slot, index) => (
                                  <div key={index}>
                                    {slot.day}: {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">
                    No additional component selections required.
                  </p>
                )}
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded hover:bg-gray-200 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  disabled={Object.keys(componentGroups).some(
                    (type) => !selectedComponents[type]
                  )}
                >
                  Confirm Selection
                </button>
              </div>
            </>
          )}
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
}