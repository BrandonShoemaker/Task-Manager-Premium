var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  auditTask(taskLi);
  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function(){
  var text = $(this)
            .text()
            .trim();

  var editInput = $("<textarea>")
                  .addClass("form-control")
                  .val(text); 

  $(this).replaceWith(editInput);
  editInput.trigger("focus");
});

$(".list-group").on("blur", "textarea", function () {
    var text = $(this)
              .val()
              .trim();

    var status = $(this).closest(".list-group")
                  .attr("id")
                  .replace("list-", "");

    var index = $(this).closest(".list-group-item")
                .index();

    tasks[status][index].text = text;
    saveTasks();

    var taskP = $("<p>")
                .addClass("m-1")
                .text(text);

    $(this).replaceWith(taskP);
});

$(".list-group").on("click", "span", function(){
  var maxDate = $(this)
    .text()
    .trim();

  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(maxDate);

  $(this).replaceWith(dateInput);

  dateInput.datepicker({
    minDate: 0,
    onClose: function(){
      $(this).trigger("change");
    }
  });

  dateInput.trigger("focus");
});

$(".list-group").on("change", "input[type='text']", function(){
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  var index = $(this)
    .closest(".list-group-item")
    .index();

  var maxDate = $(this)
    .val()
    .trim();

  tasks[status][index].date = maxDate;

  var pEl = $("<span>")
    .addClass("badge badge-primary bade-pill")
    .text(maxDate);

  $(this).replaceWith(pEl);
  saveTasks();
  auditTask($(pEl).closest(".list-group-item"));
});

$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  tolerance: "pointer",
  scroll: false,
  helper: "clone",
  activate: function(event){
    console.log("activate", this);
    console.log(this);
    $(this).addClass("dropover");
    $(".trash-bottom").addClass("trash-bottom-drag");
  },
  deactivate: function(event){
    console.log("deactivate ", this);
    $(this).removeClass("dropover");
    $(".trash-bottom").removeClass("trash-bottom-drag");
  },
  over: function(event){
    console.log("over ", event.target);
    $(this).addClass("dropover-active");
  },
  out: function(event){
    console.log("out ", event.target);
    $(this).removeClass("dropover-active");
  },
  update: function(event){
    var tempArr = [];
    if($(this).children().length === 0){
      var id = $(this).attr("id").replace("list-", "");
      tasks[id] = tempArr;
    }
    $(this).children().each(function(){
      var status = $(this)
        .closest(".list-group")
        .attr("id")
        .replace("list-", "");

      var index = $(this)
        .index();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      var text = $(this)
        .find("p")
        .text()
        .trim();
    

      tempArr.push({
        text: text,
        date: date
      });
      tasks[status] = tempArr;
    });
    saveTasks();
  }

});

$("#trash").droppable({
  accept: ".list-group-item",
  tolerance: "touch",
  drop: function(event, ui){
    ui.draggable.remove();
    $(this).removeClass("trash-bottom-active");
  },
  over: function(event){
    $(this).addClass("trash-bottom-active");
  },
  out: function(event){
    $(this).removeClass("trash-bottom-active");
  },
});

// audits
function auditTask(taskLi){
  var date = $(taskLi)
    .find("span")
    .text()
    .trim();

  var time = moment(date, "L").set("hour", 17);

  $(taskLi).removeClass("list-group-item-warning list-group-item-danger");
  if(moment().isAfter(time)){
    $(taskLi).addClass("list-group-item-danger");
  }
  else if(Math.abs(moment().diff(time, "days")) <= 2){
    $(taskLi).addClass("list-group-item-warning");
  }
}


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// date picker
$("#modalDueDate").datepicker({
  minDate: 0
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function() {
  debugger;
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();
$(".card .list-group-item").each(function(index, el){
  auditTask(el);
}, 5000);


