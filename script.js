
var default_item = {
  id: "new_section",
  titre: "",
  analogie: "",
  valeurAnalogie: "",
  description: "",
  img: "img/paper-2095674_1280.jpg",
  alt: ""
}

// on créé un observeur pour detecter qu'une image est affichée
// on lui applique la classe "show", et on trouve le menu
// correspondant pour lui appliquer la classe "active"
var imagesObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
      var sectionId = entry.target.parentElement.id
      var linkElement = document.querySelector("#link_" + sectionId)
      if (linkElement) {
        if (entry.isIntersecting) {
            entry.target.classList.add("show")
            linkElement.classList.add("active")
        } else {
            entry.target.classList.remove("show")
            linkElement.classList.remove("active")
        }
      }
  })
}, {
  threshold: 0.5
})

function addAnimation(){
  var scroller = document.querySelector(".scroller");
  if (scroller) {
      scroller.setAttribute('data-animated', true);

      const scrollerInner = scroller.querySelector(".tag-list");
      const scrollerContent = Array.from(scrollerInner.children);

      scrollerContent.forEach(function(item){
          const duplicatedItem = item.cloneNode(true);
          duplicatedItem.setAttribute("aria-hidden", true);
          scrollerInner.appendChild(duplicatedItem);
      });
  }
}

function get_section_element(templatedata, jsonelement) {
    var element = document.createElement("div")
    element.classList.add('sectionimg')
    var codeDuBloc = templatedata
    Object.keys(jsonelement).forEach(function(elt){
        codeDuBloc = codeDuBloc.replace("{{" + elt + "}}", jsonelement[elt])
    });
    element.innerHTML = codeDuBloc
    return element
}

function add_nav_link(jsonelement) {
    var navElement = document.querySelector("#links")
    var navLinkElement = document.createElement("a")
    navLinkElement.setAttribute("href", "#" + jsonelement.id)
    navLinkElement.id = "link_" + jsonelement.id
    navLinkElement.classList = "nav-link"
    navLinkElement.innerHTML = jsonelement.analogie
    navElement.appendChild(navLinkElement)
}

function add_scroller_item(jsonelement) {
  var scrollerElement = document.querySelector(".tag-list")
  var tagElement = document.createElement("li")
  tagElement.innerHTML = jsonelement.id
  scrollerElement.appendChild(tagElement)
}

function fill_sections(templatedata, jsondata) {
    // push a new json element with default values
    // this json element is the element for form preview
    // it is hidden by default, and its id is "new_section"
    jsondata.push(default_item)

    var sections = document.querySelector(".liste-analogie")
    jsondata.forEach(function(element) {
        // fill the section body from template
        sections.appendChild(get_section_element(templatedata, element))

        // add menus and scroller except for special item "new_section"
        if (element.id != "new_section") {
          // top nav items
          add_nav_link(element)
          // scroller items
          add_scroller_item(element)
        }
    })

    // images observer
    var imageElements = document.querySelectorAll(".images");
    imageElements.forEach((el) => imagesObserver.observe(el));
    // add animation for scroller
    if (!window.matchMedia("prefers-reduced-motion : reduce)").matches){
        addAnimation()
    }
}

function get_template() {
  return fetch('template.html').then((reponse) => reponse.text())
}

function get_json(url) {
  return fetch(url).then((reponse) => reponse.json())
}

function get_form_data() {
  var form_data = {}
  document.querySelectorAll('.w100').forEach((form_elt) => {
      form_data[form_elt.id] = form_elt.value
  })
  return form_data
}

document.addEventListener("DOMContentLoaded", (event) => {
  //importing datas from json file & animating images.
  var form = document.querySelector("#new_item")
  get_json('analogies.json')
    .then((jsondata) => {
      get_template() 
        .then((templatedata) => {
          fill_sections(templatedata, jsondata)
          form.addEventListener('keyup', () => {
            jsonelement = get_form_data()
            if (jsonelement.img == "") {
              jsonelement.img = default_item.img
            }

            var section = document.getElementById("new_section")
            // if image is empty, use the default value
            // create a new node that will replace the section parent
            var new_node = get_section_element(templatedata, jsonelement)

            new_node.querySelector("section").setAttribute("style", "display: flex;")
            section.parentElement.replaceWith(new_node)
          })
          var button = form.querySelector("button")
          button.addEventListener("click", () => {
            if (form.checkValidity()) {
              var section = document.getElementById("new_section")
              //var base_url = "https://httpbin.org/get"
              var base_url = "http://perso-etudiant.u-pem.fr/~gambette/portrait/api.php"
              var url = base_url + "?format=json&login=thomas.veber" + "&message=" + section.querySelector(".text").innerHTML + "&courriel=" + form.querySelector("#email").value
              console.log("Sending to API " + base_url + "...")
              get_json(encodeURI(url))
                .then((jsondata) => {
                  console.log("API response:", jsondata)
                })
            }
          })
        })
    })
})
