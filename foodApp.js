Vue.component('alimento-item', {
  props: ['alimento'],
  template: '<li class="alimento-item"\
              v-on:click="selectAlimento(alimento)"\
              v-bind:class="{ selected: isSelected }">\
                {{ alimento.alimento }} - {{ alimento.porzione }} - \
                {{ alimento.kcal }}kcal\
              </li>',
  data: function () {
    return {
      isSelected: false
    }
  },
  methods: {
    selectAlimento: function (alimento) {
      this.isSelected = !this.isSelected
      if (this.isSelected) {
        this.$parent.kcal += alimento.kcal
        this.$parent.proteine += alimento.proteine
        this.$parent.lipidi += alimento.lipidi
        this.$parent.carboidrati += alimento.carboidrati
        this.$parent.fibra += alimento.fibra
      }
      else {
        this.$parent.kcal -= alimento.kcal
        if (this.$parent.kcal < 0.01) {this.$parent.kcal = 0}
        this.$parent.proteine -= alimento.proteine
        if (this.$parent.proteine < 0.01) {this.$parent.proteine = 0}
        this.$parent.lipidi -= alimento.lipidi
        if (this.$parent.lipidi < 0.01) {this.$parent.lipidi = 0}
        this.$parent.carboidrati -= alimento.carboidrati
        if (this.$parent.carboidrati < 0.01) {this.$parent.carboidrati = 0}
        this.$parent.fibra -= alimento.fibra
        if (this.$parent.fibra < 0.01) {this.$parent.fibra = 0}
      }
    }
  }
})

Vue.component('totalizer', {
  props: ['kcal', 'proteine', 'lipidi', 'carboidrati', 'fibra'],
  template: '<div id="totalizer">\
               <div>KCAL<br>{{ Math.abs(this.$parent.kcal).toFixed(0) }}</div>\
               <div>PROTEINE<br>{{ Math.abs(this.$parent.proteine).toFixed(1) }}g<br>{{ Math.abs(this.$parent.proteinePerc()).toFixed(0) }}%</div>\
               <div>LIPIDI<br>{{ Math.abs(this.$parent.lipidi).toFixed(1) }}g<br>{{ Math.abs(this.$parent.lipidiPerc()).toFixed(0) }}%</div>\
               <div>CARBOIDRATI<br>{{ Math.abs(this.$parent.carboidrati).toFixed(1) }}g<br>{{ Math.abs(this.$parent.carboidratiPerc()).toFixed(0) }}%</div>\
               <div>FIBRA<br>{{ Math.abs(this.$parent.fibra).toFixed(1) }}g<br>{{ Math.abs(this.$parent.fibraPerc()).toFixed(0) }}%</div>\
             </div>',
})

var app = new Vue({
  el: '#app',
  data: {
    alimenti: [],
    kcal: 0,
    proteine: 0,
    lipidi: 0,
    carboidrati: 0,
    fibra: 0
  },
  mounted: function () {
    var $vm = this;
    blockspring.runParsed("query-google-spreadsheet", {
      query: "SELECT *",
      url: "https://docs.google.com/spreadsheets/d/15lJzkHLSIJa3JAQXcBNVpmcNLjEO40mDLFXpFKLogfI/edit?usp=sharing"
    }, { cache: true, expiry: 7 }, function(res) {  $vm.alimenti = JSON.parse(res)["data"] })
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
