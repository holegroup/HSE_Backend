const Site = require("../models/site.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const TempItem = require("../models/temporary.model");
const TempPart = require("../models/tempparts.model");
const jwt = require("jsonwebtoken");



async function createSite(req, res) {
  const { site_name, location, products_stored } = req.body;
  try {
    // if(!site_name || !location || !manager || !storage_capacity || !products_stored){ 
    //     return res.status(400).json({message: "All required fields must be provided"}); 
    // }

    const newSite = new Site({
      site_name: site_name,
      location: location,
      products_stored: products_stored,
    });


    const savedSite = await newSite.save();

    return res.status(200).json({ message: "Site Created Successfully", data: savedSite });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}


// after the approval and disapproval logic these lines will be added 
async function addItemsToSite(req, res) {
  try {
    const { siteId, productId, serial_number, name } = req.body;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    // fetch user
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User Not Found' });
    }


    // Check if the serial number already exists in the Product collection
    const existingProductWithSerial = await Product.findOne({ "items.serial_number": serial_number });
    if (existingProductWithSerial) {
      return res.status(400).json({ message: "Serial number already exists in the Product collection" });
    }

    // Check if the serial number already exists in the Temp collection
    const existingTempItemWithSerial = await TempItem.findOne({ serial_number });
    if (existingTempItemWithSerial) {
      return res.status(400).json({ message: "Serial number already exists in the TempItem collection" });
    }
    // Check if the serial number already exists in the Site collection
    const existingSiteWithSerial = await Site.findOne({ "products_stored.items.serial_number": serial_number });
    if (existingSiteWithSerial) {
      return res.status(400).json({ message: "Serial number already exists in the Site collection" });
    }




    if (user.role === "supervisor" || user.role === "superadmin") {
      // here will be the product storing logic
      // Find the product to ensure the item exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.items.push({ serial_number, name });
      await product.save();





      // Find the site
      const site = await Site.findById(siteId);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }


      const productItem = product.items.find(item => item.serial_number === serial_number);
      if (!productItem) {
        return res.status(404).json({ message: "Item with the given serial number not found in the product" });
      }

      // Add the item under the product in the site
      const productInSite = site.products_stored.find((p) => p.product_id.equals(productId));
      if (productInSite) {
        // If the product already exists in the site, add the item
        productInSite.items.push({ _id: productItem._id, serial_number });
      } else {
        // If the product does not exist in the site, add it with the item
        site.products_stored.push({ product_id: productId, items: [{ _id: productItem._id, serial_number }] });
      }

      await site.save();

      return res.status(200).json({ message: "Item added to site successfully", data: site });
    } else if (user.role === "inspector") {
      // saving the product in the tempschema logic
      const tempItem = new TempItem({
        siteId,
        productId,
        serial_number,
        name,
        added_by: user._id,
      });

      await tempItem.save();

      return res.status(201).json({ message: "Item submitted for approval", data: tempItem });
    } else {
      return res.status(401).json({ message: "Unauthorized Access" });
    }


  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}







async function addPartsToSite(req, res) {
  try {
    const { productId, itemId, part_name, part_number } = req.body;

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch user
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User Not Found' });
    }

    if (user.role === 'supervisor' || user.role === 'superadmin') {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Find the item by itemId within the product's items
      const item = product.items.id(itemId);
      console.log(item, "item");
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Check if the part already exists in the item
      const existingPart = item.parts.find(part => part.part_number === part_number);
      if (existingPart) {
        return res.status(400).json({ message: "Part with this part number already exists in the item" });
      }

      const exixstingTempPart = await TempPart.findOne({ part_number });
      if (exixstingTempPart) {
        return res.status(400).json({ message: "Part with this part number already exists in the TempPart collection" });
      }

      // Add the new part to the item
      item.parts.push({ part_name, part_number });

      // Save the updated product
      await product.save();

      const newPart = item.parts.find(part => part.part_number === part_number);
      // const temp = product.items.id(itemId).parts.find(part => part.part_number === part_number)
      // console.log(newPart, "newPart"); 
      // console.log(temp, "temp part"); 


      if (!newPart) {
        return res.status(404).json({ message: "Part with the given part number not found in the Items" });
      }


      const site = await Site.findOne({ "products_stored.product_id": productId });
      if (site) {
        const productInSite = site.products_stored.find(p => p.product_id.equals(productId));
        if (productInSite) {
          const itemInSite = productInSite.items.find(i => i._id.equals(itemId));
          if (itemInSite) {
            itemInSite.parts.push({ _id: newPart._id, part_number });
            await site.save();
          }
        }
      }
      return res.status(200).json({ message: "Data Saved Successfully", data: newPart });
    }


    else if (user.role === 'inspector') {
      const tempPart = new TempPart({
        productId,
        itemId,
        part_name,
        part_number,
        added_by: user._id,
      });

      await tempPart.save();

      return res.status(201).json({ message: "Part submitted for approval", data: tempPart });
    }
    else {
      return res.status(401).json({ message: "Unauthorized Access" });
    }

    // Find the product by productId


    // return res.status(200).json({ message: "Part added to item successfully", data: site });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}





async function fetchAllSites(__, res) {
  try {
    const result = await Site.find().select("site_name location");

    if (!result) {
      return res.status(404).json({ message: "No Products Found" });
    }

    const sitesWithLocationString = result.map(site => {
      const location = site.location;
      const locationString = `${location.address}, ${location.city}, ${location.state}, ${location.country}- ${location.zip_code}`;
      return { ...site.toObject(), location: locationString };
    });

    return res.status(200).json({ message: "Saved Sites", data: sitesWithLocationString });

  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}



async function fetchProducts(req, res) {
  try {
    const Id = req.params.id;

    // Find the site by ID
    const site = await Site.findById(Id).select('products_stored').exec();

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Initialize an object to store the products by equipment name
    const productsByEquip = {};

    // Loop through each product_stored and its items to fetch the product name
    for (const product of site.products_stored) {
      // For each item, find the corresponding product in the Product collection
      for (const item of product.items) {
        const productDetails = await Product.findOne({ 'items.serial_number': item.serial_number })
          .select('items.name items.serial_number equip_name _id items.parts')
          .exec();

        // console.log('Searching for item with serial number:', item.serial_number);
        // console.log('Product details found:', productDetails);

        if (productDetails) {
          // Find the specific item within the product to get its name
          const matchedItem = productDetails.items.find(i => i.serial_number === item.serial_number);
          // console.log(matchedItem, "This is matched item");

          // Add the item to the corresponding equipment category
          const equipName = productDetails.equip_name;
          const product_id = productDetails._id
          if (!productsByEquip[equipName]) {
            productsByEquip[equipName] = {
              product_id: product_id,
              items: []
            };
          }

          productsByEquip[equipName].items.push({
            serial_number: item.serial_number,
            name: matchedItem ? matchedItem.name : 'Unknown',
            _id: item._id,
            // parts: item.parts
            parts: matchedItem
              ? matchedItem.parts.map(part => ({
                part_name: part.part_name,
                part_number: part.part_number,
                _id: part._id,
              }))
              : []
          });
        }
      }
    }

    // Format the result as an array of equipment objects
    const result = Object.keys(productsByEquip).map(equipName => ({
      equip_name: equipName,
      product_id: productsByEquip[equipName].product_id,
      items: productsByEquip[equipName].items
    }));

    // Return the items with their names
    return res.status(200).json({ data: result });

  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}



async function fetchAllTempItems(__, res) {
  try {
    const tempItems = await TempItem.find()
      .populate({ path: "siteId", select: "site_name" })
      .populate({ path: "productId", select: "equip_name" })
      .populate({ path: "added_by", select: "name" }); // site_name, equip_name, name

    return res.status(200).json({ data: tempItems });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}


async function fetchAllTempParts(__, res) {
  try {
    const tempParts = await TempPart.find().populate({ path: "productId", select: "equip_name" }).populate({ path: "added_by", select: "name" });

    const result = await Promise.all(tempParts.map(async (part) => {
      // Find the product for each part
      const product = await Product.findById(part.productId);
      
      console.log(part.itemId, "part");

      // Find the item that matches the itemId in the TempPart schema
      const item = product.items.find(item => item._id.toString() === part.itemId.toString());

      return {
        ...part.toObject(),
        itemId:{ 
          _id: item ?  item._id : null, 
          item_name: item ? item.name : null
        } // Add item_name if item is found
      };
    }));

    return res.status(200).json({ data: result });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}






async function tempItemsStatusChange(req, res) {
  try {
    const { tempItemId, status } = req.body;
    const tempItem = await TempItem.findById(tempItemId);
    if (!tempItem) {
      return res.status(404).json({ message: "Temp Item not found" });
    }



    if (status === "Approved") {

      const product = await Product.findById(tempItem.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.items.push({
        serial_number: tempItem.serial_number,
        name: tempItem.name
      });
      await product.save();

      const site = await Site.findById(tempItem.siteId);
      console.log(site);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      // Add the item to the site
      const productItem = product.items.find(item => item.serial_number === tempItem.serial_number);
      if (!productItem) {
        return res.status(403).json({ message: "Item with the given serial number not exist in the product" });
      }

      const productInSite = site.products_stored.find((p) => p.product_id.equals(tempItem.productId));
      if (productInSite) {
        // If the product already exists in the site, add the item
        productInSite.items.push({ _id: productItem._id, serial_number: tempItem.serial_number });  //problem in this line
      } else {
        // If the product does not exist in the site, add it with the item
        site.products_stored.push({ product_id: tempItem.productId, items: [{ _id: productItem._id, serial_number: tempItem.serial_number }] });
      }

      await site.save();
      // Delete the temp item if status is Approved
      await TempItem.findByIdAndDelete(tempItemId);
      return res.status(200).json({ message: "Item Saved Successfully", data: site });
    }



    else if (status === "Rejected") {
      // Delete the temp item if status is Disapproved
      await TempItem.findByIdAndDelete(tempItemId);
      return res.status(200).json({ message: "Item Removed Successfully" });
    }

    // after saving the item in the site delete the from the tempSchema


  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}


async function tempPartsStatusChange(req, res) {
  try {
    const { tempPartId, status } = req.body;
    console.log(tempPartId, status);
    const tempPart = await TempPart.findById(tempPartId);

    if (!tempPart) {
      return res.status(404).json({ message: "Temp Part not found" });
    }

    if (status === 'Approved') {
      // status approval logic
      const product = await Product.findById(tempPart.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const item = product.items.id(tempPart.itemId);
      console.log(item, "item");
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // // Check if the part already exists in the item
      // const existingPart = item.parts.find(part => part.part_number === part_number);
      // if (existingPart) {
      //   return res.status(400).json({ message: "Part with this part number already exists in the item" });
      // }

      // const exixstingTempPart = await TempPart.findOne({ part_number });
      // if (exixstingTempPart) {
      //   return res.status(400).json({ message: "Part with this part number already exists in the TempPart collection" });
      // }

      // Add the new part to the item
      item.parts.push({ part_name: tempPart.part_name, part_number: tempPart.part_number });

      // Save the updated product
      await product.save();

      const newPart = item.parts.find(part => part.part_number === tempPart.part_number);
      // const temp = product.items.id(itemId).parts.find(part => part.part_number === part_number)
      // console.log(newPart, "newPart"); 
      // console.log(temp, "temp part"); 


      if (!newPart) {
        return res.status(404).json({ message: "Part with the given part number not found in the Items" });
      }


      const site = await Site.findOne({ "products_stored.product_id": tempPart.productId });
      if (site) {
        const productInSite = site.products_stored.find(p => p.product_id.equals(tempPart.productId));
        if (productInSite) {
          const itemInSite = productInSite.items.find(i => i._id.equals(tempPart.itemId));
          if (itemInSite) {
            itemInSite.parts.push({ _id: newPart._id, part_number: tempPart.part_number });
            await site.save();
          }
        }
      }

      await TempPart.findByIdAndDelete(tempPartId);
      return res.status(200).json({ message: "Data Saved Successfully", data: newPart });



    }

    else if (status === 'Rejected') {
      await TempPart.findByIdAndDelete(tempPartId);
      console.log(tempPart, "tempPart");
      return res.status(200).json({ message: "Part Removed Successfully" });
    }


  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}




//   need to make an api for approved and disapproved


module.exports = { createSite, addItemsToSite, addPartsToSite, fetchAllSites, fetchProducts, tempItemsStatusChange, fetchAllTempItems, fetchAllTempParts, tempPartsStatusChange }; 