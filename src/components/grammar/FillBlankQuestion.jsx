import { useState } from "react";

export default function FillBlankQuestion({
  item
}) {

  const [selected,setSelected] =
    useState("");

  const [result,setResult] =
    useState("");

  const submit = () => {

    if(selected === item.answer){
      setResult("Đúng");
    }else{
      setResult("Sai");
    }

  };

  return (
    <div>

      <h3>
        {item.sentence}
      </h3>

      <select
        value={selected}
        onChange={(e)=>
          setSelected(
            e.target.value
          )
        }
      >
        <option value="">
          Chọn
        </option>

        {item.options.map(op=>(
          <option
            key={op}
            value={op}
          >
            {op}
          </option>
        ))}
      </select>

      <button
        onClick={submit}
      >
        Kiểm tra
      </button>

      <p>{result}</p>

    </div>
  );
}