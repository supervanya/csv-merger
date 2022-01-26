import { combineCSV } from "./csvParser.js";

const csvData = {};
const mergeForm = document.getElementById("mergeForm");
const vaultCSVinput = document.getElementById("vaultCSV");
const gmcCSVinput = document.getElementById("gmcCSV");
const fileNameTextInput = document.getElementById("mergedFileName");

function enableSubmitButton() {
  const { vaultCSV, gmcCSV } = csvData;
  const fileName = fileNameTextInput.value;
  const submitButton = document.getElementById("submit");

  if (vaultCSV && gmcCSV && fileName) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
}

function handleCsvParsing(evt) {
  const file = evt.target.files[0];
  const fieldId = evt.target.id;
  if (file) {
    const fileReader = new FileReader();
    fileReader.onload = (evt) => {
      const csvString = evt.target.result;
      // csvParsed = Papa.parse(csvString, { header: true });
      // csvData[fieldId] = csvParsed;
      csvData[fieldId] = csvString;
      enableSubmitButton();
    };
    fileReader.readAsText(file);
  }
}

// took this one here: https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function main() {
  fileNameTextInput.addEventListener("keyup", enableSubmitButton);
  vaultCSVinput.addEventListener("change", handleCsvParsing);
  gmcCSVinput.addEventListener("change", handleCsvParsing);
  mergeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const { vaultCSV, gmcCSV } = csvData;
    const combinedCSV = combineCSV(vaultCSV, gmcCSV);
    download(fileNameTextInput.value, combinedCSV);
  });
}

main();
