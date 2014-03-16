describe('Extending Table', function() {
  var PersonTable;

  beforeEach(function(done) {
    //store(false);
    PersonTable = null;
    localforage.setDriver('localStorageWrapper');
    localforage.clear(function() {
      done();
    });
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
      beforeEach(function(done) {
        PersonTable = Romantic.Table.extend({
          tableName: 'people',
          schema: ['first', 'last']
        });
        Person = new PersonTable();
        localforage.clear(function() {
          done();
        });
      });

      it('on create', function(done) {
        Person.create({id: 0, first: 'Jake', last: 'Craige', age: 10}, function(person){
          Person.find(0, function(person){
            expect(person.age).toBeUndefined();
            done();
          })
        });

      });

      it('on update', function(done) {
        Person.create({id: 0, first: 'Jake', last: 'Craige'}, function(person){
          person.age = 10;
          Person.update(person, function() {
            Person.find(0, function(person) {
              expect(person.age).toBeUndefined();
              done();
            });
          });

        });
      });

    });
    it('doesnt do validation if no schema provided', function() {
      PersonTable = Romantic.Table.extend({ tableName: 'people' });
      Person = new PersonTable();
      var person = {id: 0, first: 'Jake', last: 'Craige', age: 10};
      Person.create(person, function(){
        Person.find(0, function(found){
          expect(found).toEqual(person);
        })
      });
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
        Person.create({id: 0, first: 'Jake'}, function() {
          Person.find(0, function(person){
            expect(person.first).toEqual('Jake');
          })
        });

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

        it('validates string', function(done) {
          Person.create({id: 0, first: 1}, function() {
            Person.create({id: 1, first: 'Jake'}, function() {
              Person.find(0, function(person){
                expect(person.first).toBeUndefined();
                Person.find(1, function(person) {
                  expect(person.first).toEqual('Jake');
                  done();
                })
              })
            });
          });
        });

        it('validates array', function(done) {
          Person.create({id: 0, childAges: 'blah'}, function() {
            Person.create({id: 1, childAges: [1,5,6]}, function() {
              Person.find(0, function(person){
                expect(person.childAges).toBeUndefined();
                Person.find(1, function(person) {
                  expect(person.childAges).toEqual([1,5,6]);
                  done();
                })
              })
            });
          });
        });

        it('validates object', function(done) {
          Person.create({id: 0, extraInfo: 'blah'}, function() {
            Person.create({id: 1, extraInfo: {height: '6ft'}}, function() {
              Person.find(0, function(person){
                expect(person.extraInfo).toBeUndefined();
                Person.find(1, function(person) {
                  expect(person.extraInfo).toEqual({height: '6ft'});
                  done();
                })
              })
            });
          });
        });

        it('validates number', function(done) {
          Person.create({id: 0, age: 'blah'}, function() {
            Person.create({id: 1, age: 5}, function() {
              Person.find(0, function(person){
                expect(person.age).toBeUndefined();
                Person.find(1, function(person) {
                  expect(person.age).toEqual(5);
                  done();
                })
              })
            });
          });
        });

        it('validates boolean', function(done) {
          Person.create({id: 0, isAlive: 'blah'}, function() {
            Person.create({id: 1, isAlive: true}, function() {
              Person.find(0, function(person){
                expect(person.isAlive).toBeUndefined();
                Person.find(1, function(person) {
                  expect(person.isAlive).toEqual(true);
                  done();
                })
              })
            });
          });
        });

        it('validates custom function', function(done) {
          Person.create({id: 0, status: 'blah'}, function() {
            Person.create({id: 1, status: 'open'}, function() {
              Person.find(0, function(person){
                expect(person.status).toBeUndefined();
                Person.find(1, function(person) {
                  expect(person.status).toEqual('open');
                  done();
                })
              })
            });
          });
        });

      });

    });
  });
});
