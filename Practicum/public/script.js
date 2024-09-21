$(function () {
  const $courseSelect = $("#course");
  const $uvuIdInput = $("#uvuId");
  const $logsUl = $('ul[data-cy="logs"]');
  const $addLogBtn = $('button[data-cy="add_log_btn"]');
  const $logTextarea = $('textarea[data-cy="log_textarea"]');
  const $uvuIdDisplay = $("#uvuIdDisplay");
  const $uvuIdText = $("#uvuIdText");
  const $modeSelect = $("#mode");
  const $uvuIdGroup = $("#uvuIdGroup");
  const $newLogGroup = $("#newLogGroup");

  // Dark/Light Mode Handling
  const userPref = localStorage.getItem("theme");
  console.log("User Pref:", userPref || "unknown");

  const browserPref =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  console.log("Browser Pref:", browserPref);

  const mode = userPref || browserPref;
  applyMode(mode);
  $modeSelect.val(mode);

  $modeSelect.on("change", function () {
    const selectedMode = $modeSelect.val();
    applyMode(selectedMode);
    localStorage.setItem("theme", selectedMode);
  });

  function applyMode(mode) {
    if (mode === "dark") {
      $("body")
        .removeClass("bg-light text-dark")
        .addClass("bg-dark text-white");
      $("form")
        .removeClass("bg-light text-dark")
        .addClass("bg-dark text-white");
    } else {
      $("body")
        .removeClass("bg-dark text-white")
        .addClass("bg-light text-dark");
      $("form")
        .removeClass("bg-dark text-white")
        .addClass("bg-light text-dark");
    }
  }

  // Handle course selection change
  $courseSelect.on("change", function () {
    $uvuIdInput.val(""); // Clear the UVU ID input field
    $logsUl.empty(); // Clear the logs display
    $uvuIdDisplay.hide(); // Hide the logs display title
    $addLogBtn.prop("disabled", true); // Disable the Add Log button
    $newLogGroup.hide(); // Hide the New Log group
    $addLogBtn.hide(); // Hide the Add Log button

    if ($courseSelect.val()) {
      $uvuIdGroup.show();
    } else {
      $uvuIdGroup.hide();
    }
  });

  // Handle UVU ID input change
  $uvuIdInput.on("input", function () {
    const uvuId = $uvuIdInput.val().trim();
    if (uvuId.length === 8 && /^\d+$/.test(uvuId)) {
      fetchLogs($courseSelect.val(), uvuId);
    } else {
      $logsUl.empty();
      $uvuIdDisplay.hide();
      $addLogBtn.prop("disabled", true);
    }
  });

  // Fetch logs based on selected course and UVU ID using jQuery's AJAX
  function fetchLogs(courseId, uvuId) {
    $.ajax({
      url: "http://localhost:3000/logs",
      data: {
        courseId: courseId,
        uvuId: uvuId,
      },
      method: "GET",
      dataType: "json",
      success: function (data) {
        $logsUl.empty();
        $uvuIdDisplay.show();
        $uvuIdText.text(uvuId);
        if (data.length > 0) {
          data.forEach(function (log) {
            const li = $("<li>").addClass("list-group-item");
            li.html(`
              <div><small>${new Date(
                log.dateTime
              ).toLocaleString()}</small></div>
              <pre class="bg-light p-2 border"><p class="d-none">${
                log.text
              }</p></pre>
            `);
            li.on("click", function () {
              $(this).find("p").toggleClass("d-none");
            });
            $logsUl.append(li);
          });
        } else {
          $logsUl.html(
            '<li class="list-group-item"><p>No logs found.</p></li>'
          );
        }

        // Show the "New Log" group and button if logs are fetched
        $newLogGroup.show();
        $addLogBtn.show();
        $addLogBtn.prop("disabled", $logTextarea.val().trim() === "");
      },
      error: function (xhr, status, error) {
        console.error("Failed to fetch logs:", error);
        $logsUl.html(
          '<li class="list-group-item"><p>No logs found or failed to load.</p></li>'
        );
        $addLogBtn.prop("disabled", true);
      },
    });
  }

  // Enable/disable Add Log button based on textarea content
  $logTextarea.on("input", function () {
    $addLogBtn.prop(
      "disabled",
      $logTextarea.val().trim() === "" || $logsUl.html() === ""
    );
  });

  // Handle Add Log form submission using jQuery's AJAX
  $("form").on("submit", function (event) {
    event.preventDefault();
    const uvuId = $uvuIdInput.val().trim();
    const courseId = $courseSelect.val();
    const logText = $logTextarea.val().trim();

    if (logText && courseId && uvuId) {
      $.ajax({
        url: "http://localhost:3000/logs",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          courseId: courseId,
          uvuId: uvuId,
          text: logText,
          dateTime: new Date().toISOString(),
        }),
        success: function (response) {
          console.log("Log added:", response);
          fetchLogs(courseId, uvuId);
          $logTextarea.val(""); // Clear the textarea after adding the log
        },
        error: function (xhr, status, error) {
          console.error("Error adding log:", error);
        },
      });
    }
  });
});
