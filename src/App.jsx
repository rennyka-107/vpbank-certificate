import { useRef, useState, useEffect, Fragment } from "react";
import "/src/App.css";
import {
  Stage,
  Layer,
  Text,
  Image
} from "react-konva";
import { saveAs } from "file-saver";
import { read, utils } from "xlsx";
import { v4 as uuidv4 } from "uuid";
import Konva from "konva";

const URLImage = ({ src, setImageSize }) => {
  const imageRef = useRef(null);
  const [image, setImage] = useState(null);

  const loadImage = () => {
    const img = new window.Image();
    img.src = src;
    img.crossOrigin = "Anonymous";
    imageRef.current = img;
    imageRef.current.addEventListener("load", handleLoad);
  };

  const handleLoad = () => {
    setImage(imageRef.current);
    setImageSize({
      width: imageRef.current.width,
      height: imageRef.current.height,
    });
  };

  useEffect(() => {
    loadImage();
    return () => {
      if (imageRef.current) {
        imageRef.current.removeEventListener("load", handleLoad);
      }
    };
  }, []);

  useEffect(() => {
    loadImage();
  }, [src]);

  return <Image image={image} />;
};

function App() {
  const [file, setFile] = useState("");
  const canvasRef = useRef();
  const listCanvasRef = useRef({ refList: [] });
  const listTextRef = useRef({ refList: [] });
  const [__html, setHTML] = useState("");
  const [listCertificate, setListCertificate] = useState([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const layerRef = useRef();
  const [listField, setListField] = useState([
    {
      id: uuidv4(),
      fontFamily: "Arial",
      color: "#000",
      fontSize: 16,
      fieldName: "Name",
      defaultValue: "Tên học viên",
      elseAttr: null,
      x: 10,
      y: 10,
      node: null,
    },
  ]);
  const fontOptions = [
    "Arial",
    "Verdana",
    "Tahoma",
    "Times New Roman",
    "Georgia",
    "Palatino",
    "Baskerville",
    "Garamond",
    "Calibri",
    "Helvetica",
    "Courier New",
    "Consolas",
    "Monaco",
    "Inconsolata",
    "Fira Code",
    "Comic Sans MS",
    "Brush Script",
    "Pacifico",
    "Dancing Script",
    "Lobster",
    "Impact",
    "Jokerman",
    "Chiller",
    "Curlz MT",
    "Stencil",
    "Comic Neue",
    "Indie Flower",
    "Architect's Daughter",
  ];

  async function changeImage(e) {
    const base64 = await convertBase64(e.target.files[0]);
    setFile(base64);
  }

  function onChangeField(id, attr, value) {
    setListField(
      listField.map((lf) => {
        if (lf.id === id) {
          return { ...lf, [attr]: value };
        } else {
          return lf;
        }
      })
    );
  }

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  function onSave() {
    if (listCanvasRef.current.refList.length > 0) {
      listCanvasRef.current.refList.forEach((it) => {
        const dataUrl = it.node.toDataURL({
          pixelRatio: 2,
        });
        saveAs(dataUrl, it.name + ".jpg");
      });
    }
  }

  useEffect(() => {
    if (listTextRef.current.refList.length > 0) {
      listTextRef.current.refList.forEach((field) => {
        let MIN_WIDTH = 20;
        var tr = new Konva.Transformer({
          nodes: [field.node],
          padding: 5,
          flipEnabled: false,
          enabledAnchors: ["middle-left", "middle-right"],
          boundBoxFunc: (oldBox, newBox) => {
            if (Math.abs(newBox.width) < MIN_WIDTH) {
              return oldBox;
            }
            return newBox;
          },
        });
        layerRef.current.add(tr);
        field.node.on("transform", () => {
          field.node.setAttrs({
            width: Math.max(
              field.node.width() * field.node.scaleX(),
              MIN_WIDTH
            ),
            scaleX: 1,
            scaleY: 1,
          });
        });
      });
    }
  }, [listField]);

  return (
    <div className="">
      <h2 className="text-center text-[25px] text-white mt-5">
        Chỉnh sửa template
      </h2>
      <div className="">
        <div className="flex justify-center flex-col items-center ">
          <div className="">
            <button
              type="button"
              className="bg-[#d280ff] text-white rounded-md mt-5 mb-5 px-[15px] py-[5px]"
              onClick={() => {
                setListField([
                  ...listField,
                  {
                    id: uuidv4(),
                    fontFamily: "Arial",
                    color: "#000",
                    fontSize: 16,
                    fieldName: "Trường mới",
                    elseAttr: null,
                    defaultValue: "Giá trị mới",
                  },
                ]);
                if (listCertificate.length > 0) {
                  setListCertificate(
                    listCertificate.map((lc) => {
                      return { ...lc };
                    })
                  );
                }
                setListCertificate(
                  listCertificate.map((dt) => {
                    const obj = {};
                    [
                      ...listField,
                      {
                        id: uuidv4(),
                        fontFamily: "Arial",
                        color: "#000",
                        fontSize: 16,
                        fieldName: "Trường mới",
                        elseAttr: null,
                        defaultValue: "Giá trị mới",
                      },
                    ].forEach((field) => {
                      obj[field.fieldName] = dt[field.fieldName];
                    });
                    return obj;
                  })
                );
              }}
            >
              Thêm mới trường thông tin
            </button>
          </div>
          <div className="">
            <p className="text-white">
              *Lưu ý: Tên trường phải trùng khớp với tên cột trong file excel
            </p>
          </div>

          {listField.map((field, idx) => (
            <div
              key={idx + field.fontFamily}
              className="flex mt-[1%] gap-[2rem] items-center justify-around border-dotted border-[#d280ff] border-2 p-3"
            >
              <div>
                <label
                  className="font-[700] text-[20px] block text-sm text-white"
                  htmlFor="file_input"
                >
                  Tên trường
                </label>
                <input
                  className="px-[15px] py-[5px] rounded-sm bg-[white]"
                  type="text"
                  value={listField.find((it) => it.id === field.id)?.fieldName}
                  onChange={(e) =>
                    onChangeField(field.id, "fieldName", e.target.value)
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="fontSelect"
                  className="font-[700] text-[20px] block text-sm text-white"
                >
                  Font chữ:
                </label>
                <select
                  className="px-3 py-1 rounded bg-white border border-gray-300 focus:outline-none"
                  value={listField.find((it) => it.id === field.id)?.fontFamily}
                  id="fontSelect"
                  onChange={(e) =>
                    onChangeField(field.id, "fontFamily", e.target.value)
                  }
                >
                  {fontOptions.map((font, index) => (
                    <option key={index} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="colorPicker"
                  className="font-[700] text-[20px] block text-sm text-white"
                >
                  Màu chữ:
                </label>
                <input
                  className="w-8 h-8 rounded border border-gray-300 focus:outline-none"
                  id="colorPicker"
                  type="color"
                  value={listField.find((it) => it.id === field.id)?.color}
                  onChange={(e) =>
                    onChangeField(field.id, "color", e.target.value)
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="fontSizeInput"
                  className="font-[700] text-[20px] block text-sm text-white"
                >
                  Cỡ chữ:
                </label>
                <input
                  className="px-3 py-1 w-20 rounded border border-gray-300 focus:outline-none"
                  id="fontSizeInput"
                  value={listField.find((it) => it.id === field.id)?.fontSize}
                  type="number"
                  min={10}
                  max={100}
                  step="1"
                  // defaultValue={16}
                  onChange={(e) =>
                    onChangeField(field.id, "fontSize", Number(e.target.value))
                  }
                />
              </div>
              <div>
                <label
                  className="font-[700] text-[20px] block text-sm text-white"
                  htmlFor="file_input"
                >
                  Giá trị
                </label>
                <input
                  className="px-[15px] py-[5px] rounded-sm bg-[white]"
                  type="text"
                  value={
                    listField.find((it) => it.id === field.id)?.defaultValue
                  }
                  onChange={(e) =>
                    onChangeField(field.id, "defaultValue", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <div className="p-10 rounded-md flex flex-col items-center">
          <div className="flex mt-[3%] gap-[2rem] items-center">
            <label
              className="font-[700] text-[20px] block text-sm text-white"
              htmlFor="file_input"
            >
              Upload file certificate
            </label>
            <input
              onChange={changeImage}
              className="block text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              id="file_input"
              type="file"
            />
          </div>
          <div className="flex mt-5 bg-white">
            <Stage
              ref={canvasRef}
              width={file ? imageSize.width : 700}
              height={file ? imageSize.height : 500}
            >
              <Layer ref={layerRef}>
                {file ? (
                  <URLImage src={file} setImageSize={setImageSize} />
                ) : null}
                {/* {showLine && (
                  <>
                    <Line
                      points={[
                        mousePosition.x,
                        0,
                        mousePosition.x,
                        window.innerHeight,
                      ]}
                      stroke="black"
                      strokeWidth={1}
                      dash={[5, 5]}
                    />
                    <Line
                      points={[
                        0,
                        mousePosition.y,
                        window.innerWidth,
                        mousePosition.y,
                      ]}
                      stroke="black"
                      strokeWidth={1}
                      dash={[5, 5]}
                    />
                  </>
                )} */}
                {listField.map((lf) => {
                  return (
                    <Text
                      ref={(node) => {
                        const findIndex = listTextRef.current.refList.findIndex(
                          (item) => item.id === lf.id
                        );
                        if (findIndex >= 0) {
                          listTextRef.current.refList.splice(findIndex, 1);
                        }
                        listTextRef.current.refList.push({
                          node,
                          id: lf.id,
                        });
                      }}
                      id={lf.id}
                      key={lf.id}
                      onDragEnd={(e) => {
                        setListField(
                          listField.map((lfp) => {
                            if (lf.id === lfp.id) {
                              return {
                                ...lfp,
                                elseAttr: { ...e.target.attrs },
                              };
                            } else {
                              return lfp;
                            }
                          })
                        );
                      }}
                      x={50}
                      y={50}
                      align="center"
                      verticalAlign="middle"
                      draggable
                      {...lf.elseAttr}
                      fill={lf.color}
                      fontFamily={lf.fontFamily}
                      colorKey={lf.color}
                      fontSize={lf.fontSize}
                      text={lf.defaultValue}
                    />
                  );
                })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex ml-[10%] mt-[5%] gap-[2rem] items-center">
          <label className="font-[700] text-[20px] block text-sm text-white">
            Upload file data certificate excel
          </label>
          <input
            className="block text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            type="file"
            onChange={async (e) => {
              /* get data as an ArrayBuffer */
              if (e.target.files[0]) {
                const file = e.target.files[0];
                const data = await file.arrayBuffer();

                /* parse and load first worksheet */
                const wb = read(data);
                const ws = wb.Sheets[wb.SheetNames[0]];
                setHTML(utils.sheet_to_html(ws, { id: "tabeller" }));
                const dataJson = utils.sheet_to_json(ws);
                setListCertificate(
                  dataJson.map((dt) => {
                    const obj = {};
                    listField.forEach((field) => {
                      obj[field.fieldName] = dt[field.fieldName];
                    });
                    return obj;
                  })
                );
              }
            }}
          />
        </div>
        <div className="mt-5 mb-5 text-white flex items-center">
          <span className="text-[25px] font-[700]">Preview</span>
          <button
            type="button"
            className="bg-[#d280ff] text-white rounded-md ml-5 px-[15px] py-[5px]"
            onClick={onSave}
          >
            Tải xuống
          </button>
        </div>

        <div className="flex gap-2 w-[100%] flex-wrap justify-around">
          {listCertificate.length > 0 &&
            listCertificate.map((it, idx) => (
              <Stage
                key={idx}
                ref={(node) => {
                  const findIndex = listCanvasRef.current.refList.findIndex(
                    (item) => item.name === `Chứng chỉ học viên: ${it?.Name}`
                  );
                  if (findIndex >= 0) {
                    listCanvasRef.current.refList.splice(findIndex, 1);
                  }
                  listCanvasRef.current.refList.push({
                    node,
                    name: `Chứng chỉ học viên: ${it?.Name}`,
                  });
                }}
                className="stage-ref w-[40%]"
                width={file ? imageSize.width : 700}
                height={file ? imageSize.height : 500}
              >
                <Layer>
                  {file ? (
                    <URLImage src={file} setImageSize={setImageSize} />
                  ) : null}
                  {listField.map((lf) => (
                    <Text
                      id={lf.id}
                      key={lf.id}
                      {...lf.elseAttr}
                      fill={lf.color}
                      fontFamily={lf.fontFamily}
                      colorKey={lf.color}
                      fontSize={lf.fontSize}
                      text={it[lf.fieldName]}
                    />
                  ))}
                </Layer>
              </Stage>
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;
