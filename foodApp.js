class Alimenti {
    constructor () {
        this.alimenti = [];
        this.selected = [];
        this.unselected = [];
        this.suggested = [];
        this.selectedProperties = {
            kcal: 0,
            proteine: 0,
            lipidi: 0,
            carboidrati: 0,
            fibra: 0,
            totale: 0,
            proteinePerc: 0,
            lipidiPerc: 0,
            carboidratiPerc: 0,
            fibraPerc: 0
        };
        this.mediterranean = {
            proteine: 10,
            lipidi: 25,
            carboidrati: 55,
            fibra: 10,
            proteinePerc: '10%',
            lipidiPerc: '25%',
            carboidratiPerc: '55%',
            fibraPerc: '10%'
        };
        let _this = this;

        //Populate from google sheets
        blockspring.runParsed("query-google-spreadsheet", {
          query: "SELECT *",
          url: "https://docs.google.com/spreadsheets/d/15lJzkHLSIJa3JAQXcBNVpmcNLjEO40mDLFXpFKLogfI/edit?usp=sharing"
        },
        { cache: true, expiry: 72 },
        function(res) {
          let a = JSON.parse(res)["data"];
          a.forEach(function (e) {
            e.qty = 1;
            e.selected = false;
          })
          _this.alimenti = a;
          _this.unselected = a;
        })
    }

    getElementById(id) {
        return this.alimenti.find(function (e) {return e.id == id})
    }

    setQuantity(id, qty) {
        return this.getElementById(id).qty = qty
    }

    getSelected() {
        return this.alimenti.filter(function (e) {return e.selected})
    }

    getUnselected() {
        return this.alimenti.filter(function (e) {return !e.selected})
    }

    updateSelectedProperties () {
        this.selectedProperties.kcal = 0;
        this.selectedProperties.proteine = 0;
        this.selectedProperties.lipidi = 0;
        this.selectedProperties.carboidrati = 0;
        this.selectedProperties.fibra = 0;
        this.selectedProperties.proteinePerc = 0;
        this.selectedProperties.lipidiPerc = 0;
        this.selectedProperties.carboidratiPerc = 0;
        this.selectedProperties.fibraPerc = 0;

        let _this = this;
        this.getSelected().forEach(function (e) {
                _this.selectedProperties.kcal += e.kcal*e.qty;
                _this.selectedProperties.proteine += e.proteine*e.qty;
                _this.selectedProperties.lipidi += e.lipidi*e.qty;
                _this.selectedProperties.carboidrati += e.carboidrati*e.qty;
                _this.selectedProperties.fibra += e.fibra*e.qty;
            })

        this.totale = this.selectedProperties.proteine +
                      this.selectedProperties.lipidi +
                      this.selectedProperties.carboidrati +
                      this.selectedProperties.fibra;

        if (this.totale > 0) {
            this.selectedProperties.proteinePerc = 100*this.selectedProperties.proteine/this.totale;
            this.selectedProperties.lipidiPerc = 100*this.selectedProperties.lipidi/this.totale;
            this.selectedProperties.carboidratiPerc = 100*this.selectedProperties.carboidrati/this.totale;
            this.selectedProperties.fibraPerc = 100*this.selectedProperties.fibra/this.totale;
        }
        return true
    }

    updateSuggested() {
        let optimal = {
            p: (this.mediterranean.proteine*this.selectedProperties.totale)/100 - this.selectedProperties.proteine,
            l: (this.mediterranean.lipidi*this.selectedProperties.totale)/100 - this.selectedProperties.lipidi,
            c: (this.mediterranean.carboidrati*this.selectedProperties.totale)/100 - this.selectedProperties.carboidrati,
            f: (this.mediterranean.fibra*this.selectedProperties.totale)/100 - this.selectedProperties.fibra
        }

        this.suggested = []
        let distances = []
        let _this = this

        this.unselected.forEach(function (e) {
            let distance = Math.pow(optimal.p-e.proteine, 2) +
                           Math.pow(optimal.l-e.lipidi, 2) +
                           Math.pow(optimal.c-e.carboidrati, 2) +
                           Math.pow(optimal.f-e.fibra, 2)
            if (distances.length > 0) {
                if (distances[0] > distance) {
                    distances.unshift(distance)
                    _this.suggested.unshift(e)
                } else {
                    distances.push(distance)
                    _this.suggested.push(e)
                }
            } else {
                distances.push(distance)
                _this.suggested.push(e)
            }
        })
    }

    toggleSelected(id) {
        this.getElementById(id).selected = !this.getElementById(id).selected
        this.updateSelectedProperties()
        this.selected = this.getSelected()
        this.unselected = this.getUnselected()
        this.updateSuggested()
    }
}

Vue.component('alimento-item', {
  props: ['alimento'],
  template: '<li class="alimento-item"\
              v-bind:class="{ selected: alimento.selected }">\
               <h3 class="descrizione">\
                  {{ alimento.alimento }}  <a target="_blank" :href="alimento.url"><i class="fas fa-external-link-alt"></i></a>\
               </h3>\
               <p>\
                  {{ alimento.porzione }} - {{ alimento.kcal }}kcal\
               </p>\
               <div class="alimento-graph">\
                 <span class="alimento-graph-proteine" :style="{ width: getPerc(alimento).proteine }"></span>\
                 <span class="alimento-graph-lipidi" :style="{ width: getPerc(alimento).lipidi }"></span>\
                 <span class="alimento-graph-carboidrati" :style="{ width: getPerc(alimento).carboidrati }"></span>\
                 <span class="alimento-graph-fibra" :style="{ width: getPerc(alimento).fibra }"></span>\
               </div>\
                <div class="config">\
                  <span class="porzioni">\
                    <span class="button minus" v-on:click="if (alimento.qty > 1) {alimento.qty -= 1; updateProperties(alimento)}">-</span>\
                    <span class="button add" v-on:click="toggleSelect(alimento)">SELECT x{{ alimento.qty }}</span>\
                    <span class="button plus" v-on:click="alimento.qty += 1; updateProperties(alimento)">+</span>\
                  </span>\
                </div>\
              </li>',
  methods: {
    toggleSelect: function (alimento) {
      this.$parent.alimenti.toggleSelected(alimento.id)

      //Porcata ma usanto il metodo di Vue non funzionava
      document.getElementById("graph-proteine").style.width = Math.abs(this.$parent.alimenti.selectedProperties.proteinePerc) + '%'
      document.getElementById("graph-lipidi").style.width = Math.abs(this.$parent.alimenti.selectedProperties.lipidiPerc) + '%'
      document.getElementById("graph-carboidrati").style.width = Math.abs(this.$parent.alimenti.selectedProperties.carboidratiPerc) + '%'
      document.getElementById("graph-fibra").style.width = Math.abs(this.$parent.alimenti.selectedProperties.fibraPerc) + '%'
    },
    updateProperties: function (alimento) {
      if (alimento.selected) {
        this.$parent.alimenti.updateSelectedProperties()
        //Porcata ma usanto il metodo di Vue non funzionava
        document.getElementById("graph-proteine").style.width = Math.abs(this.$parent.alimenti.selectedProperties.proteinePerc) + '%'
        document.getElementById("graph-lipidi").style.width = Math.abs(this.$parent.alimenti.selectedProperties.lipidiPerc) + '%'
        document.getElementById("graph-carboidrati").style.width = Math.abs(this.$parent.alimenti.selectedProperties.carboidratiPerc) + '%'
        document.getElementById("graph-fibra").style.width = Math.abs(this.$parent.alimenti.selectedProperties.fibraPerc) + '%'
      }
    },
    getPerc: function(alimento) {
        let perc = {
            proteine: "",
            lipidi: "",
            carboidrati: "",
            fibra: ""
        }
        let total = alimento.proteine + alimento.lipidi + alimento.carboidrati + alimento.fibra;

        if (total > 0) {
            perc.proteine = alimento.proteine*100/total + '%';
            perc.lipidi = alimento.lipidi*100/total + '%';
            perc.carboidrati = alimento.carboidrati*100/total + '%';
            perc.fibra = alimento.fibra*100/total + '%';
        }

        return perc
    }
  }
})

Vue.component('totalizer', {
  template: '<div id="totalizer">\
             <div class="wrapper">\
               <h1 id="calorie">{{ Math.abs(this.$parent.alimenti.selectedProperties.kcal).toFixed(0) }} kcal</h1>\
               <div id="graph">\
                 <div class="graph">\
                   <span id="graph-proteine"></span>\
                   <span id="graph-lipidi"></span>\
                   <span id="graph-carboidrati"></span>\
                   <span id="graph-fibra"></span>\
                 </div>\
                 <div id="graph-reference">\
                   <span id="graph-proteine-reference" :style="{ width: this.$parent.alimenti.mediterranean.proteinePerc }"></span>\
                   <span id="graph-lipidi-reference" :style="{ width: this.$parent.alimenti.mediterranean.lipidiPerc }"></span>\
                   <span id="graph-carboidrati-reference" :style="{ width: this.$parent.alimenti.mediterranean.carboidratiPerc }"></span>\
                   <span id="graph-fibra-reference" :style="{ width: this.$parent.alimenti.mediterranean.fibraPerc }"></span>\
                 </div>\
               </div>\
               <div id="graph-legend">\
                 <span id="graph-proteine-legend"> </span><span>PROTEINE</span>\
                 <span id="graph-lipidi-legend"> </span><span>LIPIDI</span>\
                 <span id="graph-carboidrati-legend"> </span><span>CARBOIDRATI</span>\
                 <span id="graph-fibra-legend"> </span><span>FIBRE</span>\
               </div>\
             </div>\
             </div>'
})

Vue.component('suggested', {
  data: function () {
      return {
          isOpen: false
      }
  },
  methods: {
      toggleOpen: function () {
          this.isOpen = !thisOpen;
          console.log("called")
      }
  }
})


var app = new Vue({
  el: '#app',
  data: {
    alimenti: new Alimenti(),
    isOpen: false
  },
  created: function () {
      //this.$set(this.results, this.alimenti.getAll())
  }
});
