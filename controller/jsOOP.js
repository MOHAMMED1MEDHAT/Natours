class Person {
    constructor(name, gender, birthYear) {
        this.name = name;
        this.gender = gender;
        this.birthYear = birthYear;
    }

    calcAge() {
        return new Date().getFullYear() - this.birthYear;
    }

    get getName() {
        return this.name;
    }

    set setName(name) {
        if (name.length < 5) {
            console.log('name must be more than 5 characters');
        } else {
            this.name = name;
        }
    }
}

const John = new Person('john', 'male', 2010);
console.log(John.getName);
John.setName = 'mm';
console.log(John);
