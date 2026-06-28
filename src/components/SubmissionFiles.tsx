import { useState } from "react";
import { Download, FileCode, CheckCircle, Copy, Code, ListOrdered, BookOpen } from "lucide-react";
import {
  generateRequirements,
  generateFlaskCode,
  generateReadmeCode,
  generateJupyterNotebookCode
} from "../utils/notebook_generator";

export default function SubmissionFiles() {
  const [selectedFile, setSelectedFile] = useState<string>("notebook");
  const [copied, setCopied] = useState(false);

  // File code mappings
  const files: { [key: string]: { name: string; ext: string; content: () => string; desc: string; type: string } } = {
    notebook: {
      name: "movie_rating_prediction",
      ext: ".ipynb",
      content: generateJupyterNotebookCode,
      desc: "Complete Jupyter Notebook containing full EDA, seaborn matrices, model comparisons, and serialized pickles.",
      type: "JSON / Notebook"
    },
    flask: {
      name: "app",
      ext: ".py",
      content: generateFlaskCode,
      desc: "Robust Flask Web Server API that implements prediction endpoints with fallback calculations.",
      type: "Python Source"
    },
    requirements: {
      name: "requirements",
      ext: ".txt",
      content: generateRequirements,
      desc: "Python dependencies manifest for virtual environment installation (scikit-learn, pandas, flask).",
      type: "Text Config"
    },
    readme: {
      name: "README",
      ext: ".md",
      content: generateReadmeCode,
      desc: "Comprehensive markdown documentation explaining your methodology, results, and architecture.",
      type: "Markdown Docs"
    }
  };

  const handleDownload = (fileKey: string) => {
    const file = files[fileKey];
    if (!file) return;

    const element = document.createElement("a");
    const blob = new Blob([file.content()], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(blob);
    element.download = file.name + file.ext;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = (fileKey: string) => {
    const file = files[fileKey];
    if (!file) return;

    navigator.clipboard.writeText(file.content());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* File List side column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <h4 className="text-lg font-bold text-slate-900">Internship Artifacts</h4>
          </div>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            These files have been generated exactly to match the requirements of the CodSoft Data Science task submission.
          </p>

          <div className="space-y-3">
            {Object.keys(files).map(k => {
              const file = files[k];
              const isSelected = selectedFile === k;
              return (
                <div
                  key={k}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-indigo-200 bg-indigo-50/50 shadow-sm"
                      : "border-slate-100 hover:border-slate-200 bg-slate-50/20"
                  }`}
                  onClick={() => setSelectedFile(k)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 text-sm">
                      {file.name}
                      <span className="text-indigo-600 font-semibold">{file.ext}</span>
                    </span>
                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase">
                      {file.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 lines-clamp-2 leading-relaxed">
                    {file.desc}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(k);
                      }}
                      className="text-xs flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(k);
                      }}
                      className="text-xs flex items-center gap-1 font-bold text-slate-600 hover:text-slate-800 transition-colors ml-auto"
                    >
                      {copied && selectedFile === k ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GitHub Structure Guide */}
        <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 mb-3 text-indigo-300">
            <ListOrdered className="w-5 h-5" />
            <h4 className="text-sm font-semibold tracking-tight">GitHub Structure Guidelines</h4>
          </div>
          <p className="text-xs text-slate-400 mb-4 lh-relaxed">
            Create a repository named `CodSoft-Movie-Rating-Prediction` and push these files to the root of your repository:
          </p>
          <pre className="font-mono text-xs text-indigo-200 bg-slate-850 p-4 rounded-xl border border-slate-800 leading-normal">
{`CodSoft-Movie-Rating-Prediction/
├── IDMB_Movies_India.csv
├── movie_rating_prediction.ipynb
├── app.py
├── requirements.txt
└── README.md`}
          </pre>
        </div>
      </div>

      {/* Code Editor and Previewer panel */}
      <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[700px]">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-600" />
            <h4 className="text-lg font-bold text-slate-900">
              Source Code Preview: {files[selectedFile].name}
              <span className="text-indigo-600">{files[selectedFile].ext}</span>
            </h4>
          </div>

          <button
            onClick={() => handleCopy(selectedFile)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition duration-150"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Entire File</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic code text view window */}
        <div className="grow overflow-auto bg-slate-950 text-slate-200 p-6 rounded-xl font-mono text-xs md:text-sm leading-relaxed border border-slate-900 shadow-inner">
          <pre className="whitespace-pre select-text">
            {files[selectedFile].content()}
          </pre>
        </div>
      </div>

    </div>
  );
}
