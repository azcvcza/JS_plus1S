var Genea = /** @class */ (function () {
    function Genea(config) {
        this.currentGeneration = 0;
        this.populations = [];
        this.fitnesses = [];
        this.mutateProbability = config.mutateProbability || 0.5;
        this.generationsSize = config.populationSize || 100;
        this.doneFitness = config.doneFitness || 1;
        this.populationSize = config.populationSize || 100;
        this.geneLength = config.geneLength;
        this.getFitness = config.getFitness;
        this.outOfGenerationsSize = config.outOfGenerationsSize || this.outOfGenerationsSize;
        this.onGeneration = config.onGeneration || this.onGeneration;
        this.done = config.done || this.done;
    }
    Genea.prototype.start = function () {
        this.initPopulation();
        this.makeFitnesses();
        this.select();
    };
    Genea.prototype.initPopulation = function () {
        this.currentGeneration = 1;
        this.populations = [];
        for (var i = 0, len = this.populationSize; i < len; i++) {
            var gene = getRandomGene(this.geneLength);
            this.populations.push(gene);
        }
        this.onGeneration(this.currentGeneration, this.populations);
    };
    Genea.prototype.select = function () {
        if (this.currentGeneration >= this.generationsSize) {
            return this.outOfGenerationsSize(this.populations, this.fitnesses);
        }
        var matches = this.getMatches();
        if (matches.length > 0) {
            return this.done(matches);
        }
        this.generateNextGeneration();
    };
    Genea.prototype.makeFitnesses = function () {
        var _this = this;
        this.fitnesses = [];
        this.totalFitness = 0;
        this.populations.forEach(function (individual, i) {
            var fitness = _this.getFitness(individual, _this.populations);
            _this.fitnesses[i] = fitness;
            _this.totalFitness += fitness;
        });
    };
    Genea.prototype.getMatches = function () {
        var _this = this;
        var bests = [];
        this.populations.forEach(function (individuals, i) {
            var fitness = _this.fitnesses[i];
            if (fitness >= _this.doneFitness) {
                bests.push({
                    gene: individuals,
                    fitness: fitness,
                    pos: i
                });
            }
        });
        return bests;
    };
    Genea.prototype.generateNextGeneration = function () {
        this.currentGeneration++;
        var oldPopulations = this.populations;
        var newPopulations = [];
        for (var i = 0, len = oldPopulations.length; i < len; i++) {
            var father = this.rotate();
            var mother = this.rotate();
            var child = this.crossOver(father, mother);
            child = this.mutate(child);
            newPopulations.push(child);
        }
        this.populations = newPopulations;
        this.makeFitnesses();
        this.onGeneration(this.currentGeneration, this.populations);
        this.select();
    };
    Genea.prototype.crossOver = function (father, mother) {
        var pos = Math.floor(father.length * Math.random());
        var child1 = father.substring(0, pos) + mother.substring(pos);
        var child2 = mother.substring(0, pos) + father.substring(pos);
        return this.getFitness(child1) > this.getFitness(child2)
            ? child1
            : child2;
    };
    Genea.prototype.mutate = function (child) {
        var mutateProbability = Math.random();
        if (mutateProbability < this.mutateProbability) {
            return child;
        }
        var pos = Math.floor(Math.random() * this.geneLength);
        var arr = child.split('');
        arr[pos] = +child[pos] ^ 1;
        return arr.join('');
    };
    Genea.prototype.rotate = function () {
        var pos = Math.random();
        var soFar = 0;
        for (var i = 0, len = this.fitnesses.length; i < len; i++) {
            var fitness = this.fitnesses[i];
            soFar += fitness;
            if (soFar / this.totalFitness >= pos) {
                return this.populations[i];
            }
        }
    };
    Genea.prototype.done = function () {
    };
    Genea.prototype.onGeneration = function () {
    };
    Genea.prototype.outOfGenerationSize = function () {
    };
    return Genea;
}());
function getRandomGene(len) {
    var gene = "";
    for (var i = 0; i < len; i++) {
        gene += ((Math.floor(Math.random() * 100)) % 2 === 0)
            ? '1'
            : '0';
    }
    return gene;
}
//end Genea
//start gen
var alphabetArr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ., '.split('');
var alphabet = (function () {
    var alphabet = {};
    alphabetArr.forEach(function (ch, i) {
        alphabet[ch] = i;
    });
})();
function getTargetStr(targetStr) {
    var binaryStr = '';
    for (var i = 0, len = targetStr.length; i < len; i++) {
        var ch = targetStr[i];
        var chIndex = alphabet[ch];
        binaryStr += paddingWith0((Number(chIndex).toString(2)));
    }
    return binaryStr;
}
function paddingWith0(num) {
    while (num.length < 6) {
        num = '0' + num;
    }
    return num;
}
function run(str) {
    var target = getTargetStr(str);
    var ga = new Genea({
        geneLength: target.length,
        mutateProbability: 0.5,
        doneFitness: 1,
        populationSize: 20,
        generationsSize: 400,
        getFitness: function (gene) {
            var count = 0;
            for (var i = 0, len = gene.length; i < len; i++) {
                if (gene[i] === target[i]) {
                    count++;
                }
            }
            var likeness = count / target.length;
            return likeness;
        },
        onGeneration: function (generation, genes) {
            var max = 0;
            var index = 0;
            this.fitnesses.forEach(function (fitness, i) {
                if (fitness > max) {
                    max = fitness;
                    index = i;
                }
            });
            this.history.push(toChars(genes[index]));
        }
    });
    ga.history = [];
    ga.start();
    return ga;
}
function toChars(gene) {
    var str = '';
    while (gene.length) {
        var ch = '00' + gene.substr(0, 6);
        gene = gene.substr(6);
        var chIndex = parseInt(ch, 2);
        if (chIndex >= alphabetArr.length) {
            chIndex = Math.floor(Math.random() * (alphabetArr.length - 1));
        }
        if (!alphabetArr[chIndex])
            console.log(chIndex, parseInt(ch, 2));
        str += alphabetArr[chIndex];
    }
    return str;
}
//end gen
//start main
isRunning = false;
function listen_dom() {
    document.getElementById('head').addEventListener('click', function () {
        if (isRunning)
            return;
        play();
    });
}
function play_dom() {
    var head = document.getElementById('head');
    var history = run('Too young,too simple. Sometimes, naive');
    isRunning = true;
    var i = 0;
    history.forEach(function (text, i) {
        setTimeout(function () {
            head.innerText = text;
            if (++i === history.length) {
                isRunning = false;
            }
        }, i * 30);
    });
}
var init_dom = function () {
    listen_dom();
    play_dom();
};
init_dom();
