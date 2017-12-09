class Alimenti {
    constructor () {
        this.alimenti = [];
        this.selected = [];
        this.unselected = [];
        this.selectedProperties = {
            kcal: 0,
            proteine: 0,
            lipidi: 0,
            carboidrati: 0,
            fibra: 0,
            proteinePerc: 0,
            lipidiPerc: 0,
            carboidratiPerc: 0,
            fibraPerc: 0
        }
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

        let total = this.selectedProperties.proteine +
                    this.selectedProperties.lipidi +
                    this.selectedProperties.carboidrati +
                    this.selectedProperties.fibra;

        if (total > 0) {
            this.selectedProperties.proteinePerc = 100*this.selectedProperties.proteine/total;
            this.selectedProperties.lipidiPerc = 100*this.selectedProperties.lipidi/total;
            this.selectedProperties.carboidratiPerc = 100*this.selectedProperties.carboidrati/total;
            this.selectedProperties.fibraPerc = 100*this.selectedProperties.fibra/total;
        }
        return true
    }

    toggleSelected(id) {
        this.getElementById(id).selected = !this.getElementById(id).selected
        this.updateSelectedProperties()
        this.selected = this.getSelected()
        this.unselected = this.getUnselected()
    }
}

Vue.component('alimento-item', {
  props: ['alimento'],
  template: '<li class="alimento-item"\
              v-bind:class="{ selected: alimento.selected }">\
                <div class="button descrizione" v-on:click="toggleSelect(alimento)">\
                  {{ alimento.alimento }} - {{ alimento.porzione }} - \
                  {{ alimento.kcal }}kcal\
                </div>\
                <div class="config">\
                  <span class="porzioni">\
                    Porzioni: {{ alimento.qty }}\
                    <span class="button" v-on:click="if (alimento.qty > 1) {alimento.qty -= 1; updateProperties(alimento)}">-</span>\
                    <span class="button" v-on:click="alimento.qty += 1; updateProperties(alimento)">+</span>\
                  </span>\
                  <a class="button" target="_blank" :href="alimento.url">i</a>\
                </div>\
              </li>',
  methods: {
    toggleSelect: function (alimento) {
      this.$parent.alimenti.toggleSelected(alimento.id)
    },
    updateProperties: function (alimento) {
      if (alimento.selected) {
        this.$parent.alimenti.updateSelectedProperties()
      }
    }
  }
})

Vue.component('totalizer', {
  template: '<div id="totalizer">\
               <div id="calorie">{{ Math.abs(this.$parent.alimenti.selectedProperties.kcal).toFixed(0) }}kcal</div>\
               <div id="composizione">\
                 <div>PROTEINE<br>{{ Math.abs(this.$parent.alimenti.selectedProperties.proteine).toFixed(1) }}g<br>{{ Math.abs(this.$parent.alimenti.selectedProperties.proteinePerc).toFixed(0) }}%</div>\
                 <div>LIPIDI<br>{{ Math.abs(this.$parent.alimenti.selectedProperties.lipidi).toFixed(1) }}g<br>{{ Math.abs(this.$parent.alimenti.selectedProperties.lipidiPerc).toFixed(0) }}%</div>\
                 <div>CARBOIDRATI<br>{{ Math.abs(this.$parent.alimenti.selectedProperties.carboidrati).toFixed(1) }}g<br>{{ Math.abs(this.$parent.alimenti.selectedProperties.carboidratiPerc).toFixed(0) }}%</div>\
                 <div>FIBRA<br>{{ Math.abs(this.$parent.alimenti.selectedProperties.fibra).toFixed(1) }}g<br>{{ Math.abs(this.$parent.alimenti.selectedProperties.fibraPerc).toFixed(0) }}%</div>\
               </div>\
             </div>',
})


var app = new Vue({
  el: '#app',
  data: {
    alimenti: new Alimenti()
  },
  created: function () {
      //this.$set(this.results, this.alimenti.getAll())
  }
});
