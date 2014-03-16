describe("Table", function() {
  beforeEach(function(done) {
    localforage.setDriver('localStorageWrapper');
    localforage.clear(function() {
      done()
    });
  });

  describe('Initialization', function() {
    var table;
    it("requires a table name on initialization", function() {
      expect(function(){
        table = new Romantic.Table();
      }).toThrowError('You must provide a table name when initializing a table');
    });
  });

  describe('Crud Actions', function() {
    var Person,
        person1 = { id: 0, first: 'Jake', last: 'Craige'},
        person2 = { id: 1, first: 'Matthew', last: 'Hager'};
    var persons = [person1, person2];

    beforeEach(function(done) {
      Person = new Romantic.Table('person');
      // TODO: It's weird that this is in a before but I'm also testing it below
      Person.replace(persons, function() {
        done();
      });
    });

    it('#replace and #all', function(done) {
      var newPersons = [{first: 'Jim', last: 'Bob'}];
      Person.replace(newPersons, function() {
        Person.all(function(people) {
          expect(people).toEqual(newPersons);
          done();
        });
      });
    });

    describe('#find', function() {

      describe('by id', function() {
        it('id', function(done) {
          Person.find(0, function(person){
            expect(person).toEqual(persons[0]);
            done()
          })
        });
        it('with object', function(done) {
          Person.find(persons[0], function(person){
            expect(person).toEqual(persons[0]);
            done()
          })
        });
      });

      describe('by cid', function() {
        var personsWithCid;

        beforeEach(function(done) {
          personsWithCid = [
            { cid: 'abc1', first: 'Jake' },
            { cid: 'abc2', first: 'Matthew' },
            { cid: 'abc3', first: 'Daniel' },
          ];
          Person.replace(personsWithCid, function() {
            done()
          });
        });

        it('cid', function(done) {
          Person.find('abc2', function(person){
            expect(person).toEqual(personsWithCid[1]);
            done()
          })
        });

        it('with object', function(done) {
          Person.find(personsWithCid[1], function(person){
            expect(person).toEqual(personsWithCid[1]);
            done()
          })
        });
      });

      it('throws error when id/cid is not string or number', function() {
        expect(function(){
          Person.find(['anArray'])
        }).toThrowError()
      });

      it('id takes precedence over cid', function(done) {
        var personsWithCidAndId = [
          { id: 0, cid: 1, first: 'Jake' },
          { id: 1, cid: 2, first: 'Matthew' },
          { id: 2, cid: 0, first: 'Daniel' },
        ];
        Person.replace(personsWithCidAndId, function() {
            Person.find(1, function(person){
              expect(person).toEqual(personsWithCidAndId[1]);
              Person.find(2, function(person){
                expect(person).toEqual(personsWithCidAndId[2]);
                done()
              })
            })
        });
      });

    })

    it('#create', function(done) {
      var newPerson = { id: 50, first: 'Jill' };
      Person.create(newPerson, function(){
        Person.find(50, function(person){
          expect(person).toEqual(newPerson);
          done()
        });
      });
    });

    it('#update', function(done) {
      Person.find(0, function(person){
        person.first = "NewFirstName";
        Person.update(person, function(){
          Person.find(0, function(foundPerson) {
            expect(foundPerson).toEqual(person);
            done()
          });
        });
      });
    });


  });

  describe('Crud Actions: Destroy', function() {
    var Person,
        person1 = { id: 0, first: 'Jake', last: 'Craige'},
        person2 = { id: 1, first: 'Matthew', last: 'Hager'};
    var persons = [person1, person2];
    beforeEach(function() {
      Person = new Romantic.Table('person');
      // TODO: It's weird that this is in a before but I'm also testing it below
    });
    it('#destroy', function(done) {
      Person.replace(persons, function() {
        Person.all(function(people){
          Person.destroy(people[0].id, function() {
            Person.all(function(people){
              expect(people.length).toEqual(1);
              done()
            });
          });
        });
      });
    });
    it('#destroyAll', function(done) {
      person1 = { id: 0, first: 'Jake', last: 'Craige'},
      person2 = { id: 1, first: 'Matthew', last: 'Hager'};
      persons = [person1, person2];
      Person.replace(persons, function() {
        Person.all(function(people){
          expect(people.length).toEqual(2);
          Person.destroyAll(function() {
            Person.all(function(people){
              expect(people.length).toEqual(0);
              done()
            });
          });
        });
      });
    });
  });


});
