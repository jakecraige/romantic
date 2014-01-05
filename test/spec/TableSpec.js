describe("Table", function() {
  beforeEach(function() {
    store(false);
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

    beforeEach(function() {
      Person = new Romantic.Table('person');
      // TODO: It's weird that this is in a before but I'm also testing it below
      Person.replace(persons);
    });

    it('#replace and #all', function() {
      var newPersons = [{first: 'Jim', last: 'Bob'}];
      Person.replace(newPersons);
      expect(Person.all()).toEqual(newPersons);
    });

    describe('#find', function() {

      describe('by id', function() {
        it('id', function() {
          expect(Person.find(0)).toEqual(persons[0]);
        });
        it('with object', function() {
          expect(Person.find(persons[0]))
            .toEqual(persons[0]);
        });
      });

      describe('by cid', function() {
        var personsWithCid;

        beforeEach(function() {
          personsWithCid = [
            { cid: 'abc1', first: 'Jake' },
            { cid: 'abc2', first: 'Matthew' },
            { cid: 'abc3', first: 'Daniel' },
          ];
          Person.replace(personsWithCid);
        });

        it('cid', function() {
          expect(Person.find('abc2')).toEqual(personsWithCid[1]);
        });

        it('with object', function() {
          expect(Person.find(personsWithCid[1]))
            .toEqual(personsWithCid[1]);
        });
      });

      it('throws error when id/cid is not string or number', function() {
        expect(function(){
          Person.find(['anArray'])
        }).toThrowError()
      });

      it('id takes precedence over cid', function() {
        var personsWithCidAndId = [
          { id: 0, cid: 1, first: 'Jake' },
          { id: 1, cid: 2, first: 'Matthew' },
          { id: 2, cid: 0, first: 'Daniel' },
        ];
        Person.replace(personsWithCidAndId);
        expect(Person.find(1)).toEqual(personsWithCidAndId[1]);
        expect(Person.find(2)).toEqual(personsWithCidAndId[2]);
      });

    })

    it('#create', function() {
      var newPerson = { id: 50, first: 'Jill' };
      Person.create(newPerson);
      expect(Person.find(50)).toEqual(newPerson);
    });

    it('#update', function() {
      var person = Person.find(0);
      person.first = "NewFirstName";
      Person.update(person)
      expect(Person.find(0)).toEqual(person);

    });

    it('#destroy', function() {
      expect(Person.all().length).toEqual(2);
      Person.destroy(0);
      expect(Person.all().length).toEqual(1);
    });

    it('#destroyAll', function() {
      expect(Person.all().length).toEqual(2);
      Person.destroyAll()
      expect(Person.all().length).toEqual(0);
    });
  });



});
