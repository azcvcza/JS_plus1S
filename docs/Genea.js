class Genea {
    constructor(config) {
        this.currentGeneration = 0;
        this.populations = [];
        this.fitnesses = [];

        this.mutateProbability = config.mutateProbability || .5;
        this.generationSize = config.generationSize || 100;
        this.populationSize = config.populationSize || 100;
        this.doneFitness = config.doneFitness || 1;

        this.geneLength = config.geneLength;
        this.getFitness = config.getFitness;

        this.outOfGenerationSize = config.outOfGenerationSize || this.outOfGenerationSize;
        this.onGeneration = config.onGeneration || this.onGeneration;
        this.done = config.done || this.done;
    }

    start() {
        this.initPopulation();
        this.makeFitnesses();
        this.select();
    }

    initPopulation() {
        this.currentGeneration = 1;
        this.populations = [];
        for (let i = 0, len = this.populationSize; i < len; i++) {
            let gene = getRandomGene(this.geneLength);
            this.populations.push(gene);
        }
        this.onGeneration(this.currentGeneration, this.populations);
    }

    select() {
        if (this.currentGeneration >= this.generationSize) {
            return this.outOfGenerationSize(this.populations, this.fitnesses);
        }
        let matches = this.getMatches();
        if (matches.length > 0) return this.done(matches);
        this.generateNextGeneration();
    }

    makeFitnesses() {
        this.fitnesses = [];
        this.totalFitness = 0;
        this.populations.forEach((individual, i) => {
            let fitness = this.getFitness(individual, this.populations);
            this.fitnesses[i] = fitness;
            this.totalFitness += fitness;
        })
    }
    getMatches() {
        let bests = [];
        this.populations.forEach((individual, i) => {
            let fitness = this.fitnesses[i];
            if (fitness >= this.doneFitness) {
                bests.push({
                    gene: individual,
                    fitness: fitness,
                    pos: i
                })
            }
        })
        return bests;
    }
    generateNextGeneration() {
        this.currentGeneration++;
        let oldPopulations = this.populations;
        let newPopulations = [];
        for (var i = 0, len = oldPopulations.length; i < len; i++) {
            let father = this.rotate();
            let mother = this.rotate();
            let child = this.crossOver(father, mother);
            child = this.mutate(child);
            newPopulations.push(child);
        }
        this.populations = newPopulations;
        this.makeFitnesses();
        this.onGeneration(this.currentGeneration, this.populations);
        this.select();
    }

    crossOver(father, mother) {
        let pos = Math.floor(father.length * Math.random());
        let child1 = father.substring(0, pos) + mother.substring(pos);
        let child2 = mother.substring(0, pos) + father.substring(pos);
        return this.getFitness(child1) > this.getFitness(child2) ?
            child1 :
            child2
    }

    mutate(child) {
        let mutateProbability = Math.random();
        if (mutateProbability < this.mutateProbability) return child
        let pos = Math.floor(Math.random() * this.geneLength);
        let arr = child.split('');
        arr[pos] = +child[pos] ^ 1;
        return arr.join('');
    }
    rotate() {
        let pos = Math.random();
        let soFar = 0;
        for (let i = 0, len = this.fitnesses.length; i < len; i++) {
            let fitness = this.fitnesses[i];
            soFar += fitness;
            if (soFar / this.totalFitness >= pos) {
                return this.populations[i]
            }
        }
    }
    done() {

    }
    onGeneration() {

    }
    outOfGenerationSize() {

    }
}

function getRandomGene(len) {
    let gene = '';
    for (let i = 0; i < len; i++) {
        gene += ((Math.floor(Math.random() * 100)) % 2 === 0) ?
            '1' :
            '0'
    }
    return gene;
}
//end Genea
//start gen
const alphabetArr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ., '.split('');
const alphabet = (() => {
    const alphabet = {};
    alphabetArr.forEach((ch, i) => {
        alphabet[ch] = i;
    })
    return alphabet;
})()

function getTargetStr(targetStr) {
    var binaryStr = '';
    for (var i = 0, len = targetStr.length; i < len; i++) {
        const ch = targetStr[i];
        const chIndex = alphabet[ch];
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

function gen_run(str) {
    var tar = getTargetStr(str);
    const ga = new Genea({
        geneLength: tar.length,
        mutateProbability: 0.5,
        doneFitness: 1,
        populationSize: 20,
        generationSize: 400,
        getFitness: function(gene) {
            var count = 0;
            for (var i = 0, len = gene.length; i < len; i++) {
                if (gene[i] === tar[i]) count++
            }
            const likeness = count / tar.length;
            return likeness;
        },
        onGeneration: function(generation, genes) {
            var max = 0;
            var index = 0;
            this.fitnesses.forEach(function(fitness, i) {
                if (fitness > max) {
                    max = fitness;
                    index = i;
                }
            })
            this.history.push(toChars(genes[index]))
        }
    })
    ga.history = [];
    ga.start()
    return ga;
}

function toChars(gene) {
    var str = '';
    while (gene.length) {
        var ch = '00' + gene.substr(0, 6);
        gene = gene.substr(6);
        var chIndex = parseInt(ch, 2);
        if (chIndex >= alphabetArr.length) {
            chIndex = Math.floor(Math.random() * (alphabetArr.length - 1))
        }
        if (!alphabetArr[chIndex]) {
            console.log(chIndex, parseInt(ch, 2));
        }
        str += alphabetArr[chIndex]
    }
    return str;
}
//end gen
//start main

let main_isRunning = false;
const main_init = () => {
    main_listen();
    main_play();
}

function main_listen() {
    document.getElementById('head').addEventListener('click', () => {
        if (main_isRunning) return
        main_play();
    })
}

function main_play() {
    const head = document.getElementById('head');
    const history = gen_run('Too young, too simple. Sometimes, naive').history
    main_isRunning = true;
    let i = 0;
    history.forEach((text, i) => {
        setTimeout(function() {
            head.innerText = text;
            if (++i === history.length) {
                main_isRunning = false;
            }
        }, i * 300)
    })
}

main_init()