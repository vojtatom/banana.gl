from metacity.core.styles.apply import parse, LayerStyler
from pprint import pprint

data = """




@layer("Budovy") {
    @meta(ID_BUD) {
        [0 200000]: #FF0000 #FFFF00 #00FF00 #00FFFF #0000FF; 
    }
}

@layer("Terén") {
    @meta(ML) {
        "Prah61": #FF0000;
    }
}

@legend {
    "Praha 61": #FF0000;
    "ID Budov" : [0 200000] : #FF0000 #FFFF00 #00FF00 #00FFFF #0000FF; 
}




"""

p = parse(data)
pprint(p)

ls = LayerStyler(p['Terrain'])

print(ls.meta_rules)
c = ls.object_color({
    "ID_BUD": 110
})

print(c)