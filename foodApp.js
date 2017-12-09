class Alimenti {
    constructor () {
        this.alimenti = [];
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
        { cache: true, expiry: 720 },
        function(res) {  _this.alimenti = JSON.parse(res)["data"] })
    }

    getAll() {
        return this.alimenti;
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

    toggleSelected(id, qty=1) {
        this.getElementById(id).selected = !this.getElementById(id).selected
        if (this.getElementById(id).selected) {this.setQuantity(id, qty)}
        return this.updateSelectedProperties()
    }
}

Vue.component('alimento-item', {
  props: ['alimento'],
  template: '<li class="alimento-item"\
              v-bind:class="{ selected: isSelected }">\
                <div class="button descrizione" v-on:click="toggleSelect(alimento)">\
                  {{ alimento.alimento }} - {{ alimento.porzione }} - \
                  {{ alimento.kcal }}kcal\
                </div>\
                <div class="config">\
                  <span class="porzioni">\
                    Porzioni: {{ porzioni }}\
                    <span class="button" v-on:click="if (!isSelected && porzioni > 1) {porzioni -= 1}">-</span>\
                    <span class="button" v-on:click="if (!isSelected) {porzioni += 1}">+</span>\
                  </span>\
                  <a class="button" target="_blank" :href="alimento.url">i</a>\
                </div>\
              </li>',
  data: function () {
    return {
      isSelected: false,
      porzioni: 1,
    }
  },
  methods: {
    toggleSelect: function (alimento) {
      this.isSelected = !this.isSelected
      this.$parent.alimenti.toggleSelected(alimento.id, this.porzioni)
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
    alimenti: new Alimenti(),
    kcal: 0,
    proteine: 0,
    lipidi: 0,
    carboidrati: 0,
    fibra: 0
  },
  methods: {
    totale: function () {
      return this.proteine + this.lipidi + this.carboidrati + this.fibra
    },
    proteinePerc: function () {
      var perc = 100*this.proteine/this.totale()
      if (!isNaN(perc)) { return perc} else {return 0}
    },
    lipidiPerc: function () {
      var perc = 100*this.lipidi/this.totale()
      if (!isNaN(perc)) { return perc} else {return 0}
    },
    carboidratiPerc: function () {
      var perc = 100*this.carboidrati/this.totale()
      if (!isNaN(perc)) { return perc} else {return 0}
    },
    fibraPerc: function () {
      var perc = 100*this.fibra/this.totale()
      if (!isNaN(perc)) { return perc} else {return 0}
    }
  }
});
