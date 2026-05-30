const STATES = [
  {
    key: "none",
    color: "#ffffff"
  },
  {
    key: "interest",
    color: "#fddd8b"
  },
  {
    key: "like",
    color: "#fd8bc4"
  },
  {
    key: "otp",
    color: "#e53838"
  },
  {
    key: "nps",
    color: "#68b4f7"
  },
  {
    key: "dislike",
    color: "#bc8bed"
  },
  {
    key: "mine",
    color: "#000000"
  }
];

const createPage =
  document.getElementById("createPage");

const viewPage =
  document.getElementById("viewPage");

const generateBtn =
  document.getElementById("generateBtn");

const generatedArea =
  document.getElementById("generatedArea");

const generatedLink =
  document.getElementById("generatedLink");

const copyBtn =
  document.getElementById("copyBtn");

const tableTitle =
  document.getElementById("tableTitle");

const creditText =
  document.getElementById("creditText");

const logoImage =
  document.getElementById("logoImage");

const shipTable =
  document.getElementById("shipTable");

const savePngBtn =
  document.getElementById("savePngBtn");

const resetBtn =
  document.getElementById("resetBtn");

const modalOverlay =
  document.getElementById("modalOverlay");

const cancelReset =
  document.getElementById("cancelReset");

const confirmReset =
  document.getElementById("confirmReset");

let currentArchiveId = "";
let currentMembers = [];

function getArchiveParam() {
  const params =
    new URLSearchParams(window.location.search);

  return params.get("archive");
}

function showCreateMode() {
  createPage.classList.remove("hidden");
}

function showViewMode() {
  viewPage.classList.remove("hidden");
}

function encodeArchive(data) {
  return btoa(
    encodeURIComponent(
      JSON.stringify(data)
    )
  );
}

function decodeArchive(str) {
  try {

    return JSON.parse(
      decodeURIComponent(
        atob(str)
      )
    );

  } catch {

    return null;

  }
}

function buildArchiveLink(data) {

  const encoded =
    encodeArchive(data);

  const url =
    `${location.origin}${location.pathname}?archive=${encoded}`;

  generatedLink.value = url;

  generatedArea.classList.remove("hidden");

  currentArchiveId = encoded;

}

function createArchive() {

  const title =
    document
      .getElementById("titleInput")
      .value
      .trim();

  const credit =
    document
      .getElementById("creditInput")
      .value
      .trim();

  const logo =
    document
      .getElementById("logoInput")
      .value
      .trim();

  const membersRaw =
    document
      .getElementById("memberInput")
      .value;

  const members =
    membersRaw
      .split("\n")
      .map(v => v.trim())
      .filter(Boolean);

  if (!title) {
    alert("제목을 입력해주세요.");
    return;
  }

  if (members.length < 2) {
    alert("멤버를 최소 2명 입력해주세요.");
    return;
  }

  if (members.length > 50) {
    alert("멤버는 최대 50명까지 가능합니다.");
    return;
  }

  const archive = {
    title,
    credit,
    logo,
    members
  };

  buildArchiveLink(archive);

}

if (generateBtn) {

  generateBtn.addEventListener(
    "click",
    createArchive
  );

}

if (copyBtn) {

  copyBtn.addEventListener(
    "click",
    async () => {

      await navigator.clipboard.writeText(
        generatedLink.value
      );

      alert("링크가 복사되었습니다!");

    }
  );

}
function getStorageKey() {

  return `shipchart_${currentArchiveId}`;

}

function loadSavedData() {

  const raw =
    localStorage.getItem(
      getStorageKey()
    );

  if (!raw) {
    return {};
  }

  try {

    return JSON.parse(raw);

  } catch {

    return {};

  }

}

function saveData(data) {

  localStorage.setItem(
    getStorageKey(),
    JSON.stringify(data)
  );

}

function getNextState(currentKey) {

  const index =
    STATES.findIndex(
      s => s.key === currentKey
    );

  const next =
    (index + 1) % STATES.length;

  return STATES[next];

}

function applyCellColor(cell, stateKey) {

  const state =
    STATES.find(
      s => s.key === stateKey
    );

  if (!state) return;

  cell.dataset.state = state.key;

  cell.style.background =
    state.color;

  if (
    state.key === "mine"
  ) {
    cell.style.color = "#ffffff";
  } else {
    cell.style.color = "#111111";
  }

}

function createTable(members) {

  currentMembers = members;

  shipTable.innerHTML = "";

  const saved =
    loadSavedData();

  const headerRow =
    document.createElement("tr");

  const emptyCorner =
    document.createElement("th");

  emptyCorner.textContent = "";

  headerRow.appendChild(
    emptyCorner
  );

  members.forEach(member => {

    const th =
      document.createElement("th");

    th.textContent = member;

    headerRow.appendChild(th);

  });

  shipTable.appendChild(
    headerRow
  );

  members.forEach(
    (rowMember, rowIndex) => {

      const row =
        document.createElement("tr");

      const leftHeader =
        document.createElement("th");

      leftHeader.textContent =
        rowMember;

      row.appendChild(
        leftHeader
      );

      members.forEach(
        (colMember, colIndex) => {

          const td =
            document.createElement("td");

          if (
            rowIndex === colIndex
          ) {

            td.classList.add(
              "diagonal"
            );

            td.textContent = "✕";

            row.appendChild(td);

            return;

          }

          td.classList.add(
            "ship-cell"
          );

          const key =
            `${rowIndex}_${colIndex}`;

          const savedState =
            saved[key] || "none";

          applyCellColor(
            td,
            savedState
          );

          td.addEventListener(
            "click",
            () => {

              const current =
                td.dataset.state ||
                "none";

              const next =
                getNextState(
                  current
                );

              applyCellColor(
                td,
                next.key
              );

              saved[key] =
                next.key;

              saveData(saved);

            }
          );

          row.appendChild(td);

        }
      );

      shipTable.appendChild(
        row
      );

    }
  );

}
function loadArchiveMode() {

  const archiveParam =
    getArchiveParam();

  const archive =
    decodeArchive(
      archiveParam
    );

  if (!archive) {

    alert(
      "잘못된 archive 링크입니다."
    );

    return;

  }

  currentArchiveId =
    archiveParam;

  tableTitle.textContent =
    archive.title || "";

  creditText.textContent =
    archive.credit || "";

  if (
    archive.logo &&
    archive.logo.trim()
  ) {

    logoImage.src =
      archive.logo;

    logoImage.classList.remove(
      "hidden"
    );

  }

  createTable(
    archive.members
  );

}

function resetTable() {

  localStorage.removeItem(
    getStorageKey()
  );

  createTable(
    currentMembers
  );

}

if (resetBtn) {

  resetBtn.addEventListener(
    "click",
    () => {

      modalOverlay.classList.remove(
        "hidden"
      );

    }
  );

}

if (cancelReset) {

  cancelReset.addEventListener(
    "click",
    () => {

      modalOverlay.classList.add(
        "hidden"
      );

    }
  );

}

if (confirmReset) {

  confirmReset.addEventListener(
    "click",
    () => {

      modalOverlay.classList.add(
        "hidden"
      );

      resetTable();

    }
  );

}

if (savePngBtn) {

  savePngBtn.addEventListener(
    "click",
    async () => {

      const target =
        document.getElementById(
          "captureArea"
        );

      const canvas =
        await html2canvas(
          target,
          {
            backgroundColor:
              "#ffffff",
            scale: 2
          }
        );

      const link =
        document.createElement(
          "a"
        );

      link.download =
        "ship-chart.png";

      link.href =
        canvas.toDataURL(
          "image/png"
        );

      link.click();

    }
  );

}

function initialize() {

  const archive =
    getArchiveParam();

  if (archive) {

    showViewMode();

    loadArchiveMode();

  } else {

    showCreateMode();

  }

}

initialize();
