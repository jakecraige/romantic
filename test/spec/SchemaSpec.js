describe('Extending Table', function() {
  var PersonTable;

  beforeEach(function() {
    store(false);
    PersonTable = null;
  });

  describe('requires table name', function() {
    it('throws error without it', function() {
      PersonTable = Romantic.Table.extend();
      expect(function() {
        var Person = new PersonTable();
      }).toThrowError();
    });

    describe('doesnt throw error', function() {
      it('defined in extend', function() {
        PersonTable = Romantic.Table.extend({
          tableName: 'people'
        });
        expect(function() {
          var Person = new PersonTable();
        }).not.toThrowError();
      });
      it('defined in initialize', function() {
        PersonTable = Romantic.Table.extend();
        expect(function() {
          var Person = new PersonTable('people');
        }).not.toThrowError();
      });

    });
  });

  describe('Schema', function() {
    var Person;
    describe('accepts an array of keys and filters attributes', function() {
      beforeEach(function() {
        PersonTable = Romantic.Table.extend({
          tableName: 'people',
          schema: ['first', 'last']
        });
        Person = new PersonTable();
      });

      it('on create', function() {
        var person = Person.create({id: 0, first: 'Jake', last: 'Craige', age: 10});

        expect(Person.find(0).age).toBeUndefined();
      });

      it('on update', function() {
        var person = Person.create({id: 0, first: 'Jake', last: 'Craige'});
        person.age = 10;
        Person.update(person);

        expect(Person.find(0).age).toBeUndefined();
      });

    });
    it('doesnt do validation if no schema provided', function() {
      PersonTable = Romantic.Table.extend({ tableName: 'people' });
      Person = new PersonTable();
      var person = {id: 0, first: 'Jake', last: 'Craige', age: 10};
      Person.create(person);
      expect(Person.find(0)).toEqual(person);
    });

    describe('accepts an object', function() {

      it('defaults to any type of value', function() {
        PersonTable = Romantic.Table.extend({
          tableName: 'people',
          schema: {
            first: ''
          }
        });
        Person = new PersonTable();
        Person.create({id: 0, first: 'Jake'});

        expect(Person.find(0).first).toEqual('Jake');
      });

      describe('type validation', function() {
        beforeEach(function() {
          PersonTable = Romantic.Table.extend({
            tableName: 'people',
            schema: {
              first: 'string',
              childAges: 'array',
              extraInfo: 'object',
              age: 'number',
              isAlive: 'boolean',
              createdAt: 'date',
              status: function(status) {
                if(status === 'open' || status === 'closed') {
                  return true;
                }
              }
            }
          });
          Person = new PersonTable();
        });

        it('validates string', function() {
          Person.create({id: 0, first: 1});
          Person.create({id: 1, first: 'Jake'});
          expect(Person.find(0).first).toBeUndefined();
          expect(Person.find(1).first).toEqual('Jake');
        });

        it('validates array', function() {
          Person.create({id: 0, childAges: 'blah'});
          Person.create({id: 1, childAges: [1,5,6]});
          expect(Person.find(0).childAges).toBeUndefined();
          expect(Person.find(1).childAges).toEqual([1,5,6]);
        });

        it('validates object', function() {
          Person.create({id: 0, extraInfo: 'blah'});
          Person.create({id: 1, extraInfo: {height: '6ft'}});
          expect(Person.find(0).extraInfo).toBeUndefined();
          expect(Person.find(1).extraInfo).toEqual({height: '6ft'});
        });

        it('validates number', function() {
          Person.create({id: 0, age: 'blah'});
          Person.create({id: 1, age: 5});
          expect(Person.find(0).age).toBeUndefined();
          expect(Person.find(1).age).toEqual(5);
        });

        it('validates boolean', function() {
          Person.create({id: 0, isAlive: 'blah'});
          Person.create({id: 1, isAlive: true});
          expect(Person.find(0).isAlive).toBeUndefined();
          expect(Person.find(1).isAlive).toEqual(true);
        });

        it('validates custom function', function() {
          Person.create({id: 0, status: 'blah'});
          Person.create({id: 1, status: 'open'});
          expect(Person.find(0).status).toBeUndefined();
          expect(Person.find(1).status).toEqual('open');
        });

      });

    });
  });
});
