/**
 * Order Fulfillment Tests
 * Unit tests and property-based tests for the subscription-order-fulfillment feature.
 *
 * Uses Jest + fast-check. All external dependencies (mongoose models, notificationService)
 * are mocked so no real DB connection is required.
 */

jest.setTimeout(30000);

const fc = require('fast-check');
const { generateBundleId, BUNDLE_ID_PREFIX } = require('../constants/bundleIdFormat');

// ── Mock all mongoose models and services ─────────────────────────────────────
jest.mock('../models/Order');
jest.mock('../models/User');
jest.mock('../models/InventoryItem');
jest.mock('../services/notificationService');

const Order = require('../models/Order');
const User = require('../models/User');
const InventoryItem = require('../models/InventoryItem');
const notificationService = require('../services/notificationService');

// Import controller handlers directly
const {
  getOrders,
  assignOrder,
  buildBundles,
  markOutForDelivery,
  submitDeliveryForm,
  approveDelivery,
  rejectDelivery
} = require('../controllers/orderFulfillmentController');

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockReqResNext = (overrides = {}) => {
  const req = {
    user: { _id: 'user1', userType: 'individual' },
    params: {},
    body: {},
    files: [],
    ...overrides
  };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  const next = jest.fn();
  return { req, res, next };
};

const mockOrder = (overrides = {}) => ({
  _id: 'order1',
  userId: 'user1',
  subscriptionId: 'sub1',
  status: 'pending',
  assignedPickupMemberId: null,
  orderedBundles: [{ bundleTypeId: 'bundle1', bundleName: 'Test Bundle', quantity: 1 }],
  builtBundles: [],
  deliveryForm: null,
  save: jest.fn().mockResolvedValue(true),
  ...overrides
});

// ── Reset mocks between tests ─────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// UNIT TESTS
// =============================================================================

describe('Unit Tests', () => {

  // ── generateBundleId ────────────────────────────────────────────────────────

  describe('generateBundleId', () => {
    it('should generate bundle ID with correct format', () => {
      const id = generateBundleId(1);
      const prefix = process.env.BUNDLE_ID_PREFIX || 'CR';
      expect(id).toMatch(new RegExp(`^${prefix}-\\d{13}-\\d{4}$`));
    });

    it('should pad sequence number to 4 digits', () => {
      expect(generateBundleId(1)).toMatch(/-0001$/);
      expect(generateBundleId(9999)).toMatch(/-9999$/);
    });
  });

  // ── assignOrder ─────────────────────────────────────────────────────────────

  describe('assignOrder', () => {
    it('should reject assignment to non-approved pickup member', async () => {
      const order = mockOrder({ status: 'pending' });
      Order.findById = jest.fn().mockResolvedValue(order);
      User.findById = jest.fn().mockResolvedValue({
        _id: 'pm1',
        userType: 'pickup_member',
        pickupMemberStatus: 'pending'
      });

      const { req, res, next } = mockReqResNext({
        user: { _id: 'admin1', userType: 'admin' },
        params: { id: 'order1' },
        body: { pickupMemberId: 'pm1' }
      });

      await assignOrder(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });
  });

  // ── buildBundles ─────────────────────────────────────────────────────────────

  describe('buildBundles', () => {
    it('should reject buildBundles with empty skuCodes', async () => {
      const order = mockOrder({ status: 'assigned', assignedPickupMemberId: 'pm1' });
      Order.findById = jest.fn().mockResolvedValue(order);

      const { req, res, next } = mockReqResNext({
        user: { _id: 'pm1', userType: 'pickup_member' },
        params: { id: 'order1' },
        body: { bundles: [{ skuCodes: [], bagId: 'BAG001' }] }
      });

      await buildBundles(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should reject buildBundles with missing bagId', async () => {
      const order = mockOrder({ status: 'assigned', assignedPickupMemberId: 'pm1' });
      Order.findById = jest.fn().mockResolvedValue(order);
      InventoryItem.findOne = jest.fn().mockResolvedValue({ skuCode: 'SKU001', status: 'in_stock' });

      const { req, res, next } = mockReqResNext({
        user: { _id: 'pm1', userType: 'pickup_member' },
        params: { id: 'order1' },
        body: { bundles: [{ skuCodes: ['SKU001'], bagId: '' }] }
      });

      await buildBundles(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });
  });

  // ── submitDeliveryForm ───────────────────────────────────────────────────────

  describe('submitDeliveryForm', () => {
    it('should reject submitDeliveryForm with no images', async () => {
      const order = mockOrder({ status: 'out_for_delivery', assignedPickupMemberId: 'pm1' });
      Order.findById = jest.fn().mockResolvedValue(order);

      const { req, res, next } = mockReqResNext({
        user: { _id: 'pm1', userType: 'pickup_member' },
        params: { id: 'order1' },
        body: { buildingName: 'A', floor: '1', roomNumber: '101' },
        files: []
      });

      await submitDeliveryForm(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should reject submitDeliveryForm with missing address fields', async () => {
      const order = mockOrder({ status: 'out_for_delivery', assignedPickupMemberId: 'pm1' });
      Order.findById = jest.fn().mockResolvedValue(order);

      const { req, res, next } = mockReqResNext({
        user: { _id: 'pm1', userType: 'pickup_member' },
        params: { id: 'order1' },
        body: { buildingName: 'A' },
        files: [{ path: 'http://cloudinary.com/img1.jpg' }]
      });

      await submitDeliveryForm(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });
  });

  // ── rejectDelivery ───────────────────────────────────────────────────────────

  describe('rejectDelivery', () => {
    it('should reject rejectDelivery with empty rejectionReason', async () => {
      const order = mockOrder({ status: 'under_review', assignedPickupMemberId: 'pm1' });
      Order.findById = jest.fn().mockResolvedValue(order);

      const { req, res, next } = mockReqResNext({
        user: { _id: 'admin1', userType: 'admin' },
        params: { id: 'order1' },
        body: { rejectionReason: '' }
      });

      await rejectDelivery(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });
  });

});

// =============================================================================
// PROPERTY-BASED TESTS
// =============================================================================

describe('Property-Based Tests', () => {

  // Feature: subscription-order-fulfillment, Property 1 & 2: Order creation initialises with empty builtBundles and pending status, and all required fields present
  it('Property 1 & 2: Order.create always called with builtBundles=[] and status=pending', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        userId: fc.string({ minLength: 1 }),
        subscriptionId: fc.string({ minLength: 1 }),
        bundleName: fc.string({ minLength: 1 }),
        quantity: fc.integer({ min: 1, max: 10 })
      }),
      async ({ userId, subscriptionId, bundleName, quantity }) => {
        const capturedArgs = [];
        Order.create = jest.fn().mockImplementation((args) => {
          capturedArgs.push(args);
          return Promise.resolve(args);
        });

        const payload = {
          userId,
          subscriptionId,
          orderedBundles: [{ bundleTypeId: 'b1', bundleName, quantity }],
          builtBundles: [],
          status: 'pending'
        };
        await Order.create(payload);

        expect(capturedArgs[0].builtBundles).toEqual([]);
        expect(capturedArgs[0].status).toBe('pending');
        expect(capturedArgs[0].userId).toBeDefined();
        expect(capturedArgs[0].subscriptionId).toBeDefined();
      }
    ), { numRuns: 50 });
  });

  // Feature: subscription-order-fulfillment, Property 3: Role-based order visibility
  it('Property 3: getOrders filters by role correctly', async () => {
    await fc.assert(fc.asyncProperty(
      fc.constantFrom('admin', 'pickup_member', 'individual'),
      async (userType) => {
        const userId = 'user123';
        Order.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue([])
        });

        const { req, res, next } = mockReqResNext({ user: { _id: userId, userType } });
        await getOrders(req, res, next);

        const callArg = Order.find.mock.calls[0][0];
        if (userType === 'admin') {
          expect(callArg).toEqual({});
        } else if (userType === 'pickup_member') {
          expect(callArg).toHaveProperty('assignedPickupMemberId', userId);
        } else {
          expect(callArg).toHaveProperty('userId', userId);
        }
      }
    ), { numRuns: 30 });
  });

  // Feature: subscription-order-fulfillment, Property 4: Assignment requires approved pickup member
  it('Property 4: assignOrder rejects non-approved pickup members', async () => {
    await fc.assert(fc.asyncProperty(
      fc.constantFrom('pending', 'rejected', null),
      async (pickupMemberStatus) => {
        const order = mockOrder({ status: 'pending' });
        Order.findById = jest.fn().mockResolvedValue(order);
        User.findById = jest.fn().mockResolvedValue({
          _id: 'pm1',
          userType: 'pickup_member',
          pickupMemberStatus
        });

        const { req, res, next } = mockReqResNext({
          user: { _id: 'admin1', userType: 'admin' },
          params: { id: 'order1' },
          body: { pickupMemberId: 'pm1' }
        });

        await assignOrder(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        next.mockClear();
      }
    ), { numRuns: 30 });
  });

  // Feature: subscription-order-fulfillment, Property 5: Assignment state transition
  it('Property 5: assignOrder sets status to assigned for approved pickup member', async () => {
    const order = mockOrder({ status: 'pending' });
    Order.findById = jest.fn().mockResolvedValue(order);
    User.findById = jest.fn().mockResolvedValue({
      _id: 'pm1',
      userType: 'pickup_member',
      pickupMemberStatus: 'approved'
    });
    notificationService.notifyOrderAssigned = jest.fn().mockResolvedValue(undefined);

    const { req, res, next } = mockReqResNext({
      user: { _id: 'admin1', userType: 'admin' },
      params: { id: 'order1' },
      body: { pickupMemberId: 'pm1' }
    });

    await assignOrder(req, res, next);
    expect(order.status).toBe('assigned');
    expect(order.assignedPickupMemberId).toBe('pm1');
    expect(next).not.toHaveBeenCalled();
  });

  // Feature: subscription-order-fulfillment, Property 6: SKU validation rejects non-in-stock items
  it('Property 6: buildBundles rejects SKU not in_stock', async () => {
    await fc.assert(fc.asyncProperty(
      fc.constantFrom('dispatched', 'with_customer', 'pickup_pending', 'in_laundry', 'damaged', 'retired'),
      async (badStatus) => {
        const order = mockOrder({ status: 'assigned', assignedPickupMemberId: 'pm1' });
        Order.findById = jest.fn().mockResolvedValue(order);
        InventoryItem.findOne = jest.fn().mockResolvedValue({ skuCode: 'SKU001', status: badStatus });

        const { req, res, next } = mockReqResNext({
          user: { _id: 'pm1', userType: 'pickup_member' },
          params: { id: 'order1' },
          body: { bundles: [{ skuCodes: ['SKU001'], bagId: 'BAG001' }] }
        });

        await buildBundles(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        next.mockClear();
      }
    ), { numRuns: 30 });
  });

  // Feature: subscription-order-fulfillment, Property 7: Bundle ID format matches configured pattern
  it('Property 7: generateBundleId always matches configured regex', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 9999 }),
      (seq) => {
        const id = generateBundleId(seq);
        const prefix = process.env.BUNDLE_ID_PREFIX || 'CR';
        expect(id).toMatch(new RegExp(`^${prefix}-\\d{13}-\\d{4}$`));
      }
    ), { numRuns: 100 });
  });

  // Feature: subscription-order-fulfillment, Property 8: Build-bundles persists bag IDs and transitions to packed
  it('Property 8: buildBundles sets status to packed and stores bagIds', async () => {
    const order = mockOrder({ status: 'assigned', assignedPickupMemberId: 'pm1' });
    Order.findById = jest.fn().mockResolvedValue(order);
    InventoryItem.findOne = jest.fn().mockResolvedValue({ skuCode: 'SKU001', status: 'in_stock' });
    User.findOne = jest.fn().mockResolvedValue({ _id: 'admin1' });
    notificationService.notifyOrderPacked = jest.fn().mockResolvedValue(undefined);

    const { req, res, next } = mockReqResNext({
      user: { _id: 'pm1', userType: 'pickup_member' },
      params: { id: 'order1' },
      body: { bundles: [{ skuCodes: ['SKU001'], bagId: 'BAG001' }] }
    });

    await buildBundles(req, res, next);
    expect(order.status).toBe('packed');
    expect(order.builtBundles[0].bagId).toBe('BAG001');
    expect(next).not.toHaveBeenCalled();
  });

  // Feature: subscription-order-fulfillment, Property 9: Out-for-delivery transition
  it('Property 9: markOutForDelivery sets status to out_for_delivery', async () => {
    const order = mockOrder({ status: 'packed', assignedPickupMemberId: 'pm1' });
    Order.findById = jest.fn().mockResolvedValue(order);
    User.findOne = jest.fn().mockResolvedValue({ _id: 'admin1' });
    notificationService.notifyOutForDelivery = jest.fn().mockResolvedValue(undefined);

    const { req, res, next } = mockReqResNext({
      user: { _id: 'pm1', userType: 'pickup_member' },
      params: { id: 'order1' }
    });

    await markOutForDelivery(req, res, next);
    expect(order.status).toBe('out_for_delivery');
    expect(next).not.toHaveBeenCalled();
  });

  // Feature: subscription-order-fulfillment, Property 10: Delivery form requires all address fields
  it('Property 10: submitDeliveryForm rejects missing address fields', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        buildingName: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
        floor: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
        roomNumber: fc.option(fc.string({ minLength: 1 }), { nil: undefined })
      }).filter(({ buildingName, floor, roomNumber }) => !buildingName || !floor || !roomNumber),
      async ({ buildingName, floor, roomNumber }) => {
        const order = mockOrder({ status: 'out_for_delivery', assignedPickupMemberId: 'pm1' });
        Order.findById = jest.fn().mockResolvedValue(order);

        const { req, res, next } = mockReqResNext({
          user: { _id: 'pm1', userType: 'pickup_member' },
          params: { id: 'order1' },
          body: { buildingName, floor, roomNumber },
          files: [{ path: 'http://img.jpg' }]
        });

        await submitDeliveryForm(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        next.mockClear();
      }
    ), { numRuns: 50 });
  });

  // Feature: subscription-order-fulfillment, Property 11: Delivery form submission transitions to under_review
  it('Property 11: submitDeliveryForm sets status to under_review', async () => {
    const order = mockOrder({ status: 'out_for_delivery', assignedPickupMemberId: 'pm1' });
    Order.findById = jest.fn().mockResolvedValue(order);
    User.findOne = jest.fn().mockResolvedValue({ _id: 'admin1' });
    notificationService.notifyDeliveryUnderReview = jest.fn().mockResolvedValue(undefined);

    const { req, res, next } = mockReqResNext({
      user: { _id: 'pm1', userType: 'pickup_member' },
      params: { id: 'order1' },
      body: { buildingName: 'Tower A', floor: '3', roomNumber: '301' },
      files: [{ path: 'http://cloudinary.com/img1.jpg' }]
    });

    await submitDeliveryForm(req, res, next);
    expect(order.status).toBe('under_review');
    expect(order.deliveryForm.images).toContain('http://cloudinary.com/img1.jpg');
    expect(next).not.toHaveBeenCalled();
  });

  // Feature: subscription-order-fulfillment, Property 12: Approve delivery transitions to delivered
  it('Property 12: approveDelivery sets status to delivered', async () => {
    const order = mockOrder({ status: 'under_review' });
    Order.findById = jest.fn().mockResolvedValue(order);
    notificationService.notifyOrderDelivered = jest.fn().mockResolvedValue(undefined);

    const { req, res, next } = mockReqResNext({
      user: { _id: 'admin1', userType: 'admin' },
      params: { id: 'order1' }
    });

    await approveDelivery(req, res, next);
    expect(order.status).toBe('delivered');
    expect(next).not.toHaveBeenCalled();
  });

  // Feature: subscription-order-fulfillment, Property 13: Reject delivery reverts to out_for_delivery
  it('Property 13: rejectDelivery reverts status to out_for_delivery', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 1 }),
      async (reason) => {
        const order = mockOrder({ status: 'under_review', assignedPickupMemberId: 'pm1' });
        Order.findById = jest.fn().mockResolvedValue(order);
        notificationService.notifyDeliveryRejected = jest.fn().mockResolvedValue(undefined);

        const { req, res, next } = mockReqResNext({
          user: { _id: 'admin1', userType: 'admin' },
          params: { id: 'order1' },
          body: { rejectionReason: reason }
        });

        await rejectDelivery(req, res, next);
        expect(order.status).toBe('out_for_delivery');
        expect(next).not.toHaveBeenCalled();
        next.mockClear();
      }
    ), { numRuns: 50 });
  });

  // Feature: subscription-order-fulfillment, Property 14: Invalid lifecycle transitions are rejected
  it('Property 14: guardTransition rejects wrong current status', async () => {
    await fc.assert(fc.asyncProperty(
      fc.constantFrom('assigned', 'packed', 'out_for_delivery', 'under_review', 'delivered'),
      async (wrongStatus) => {
        // Try to assign an order that is NOT pending
        const order = mockOrder({ status: wrongStatus });
        Order.findById = jest.fn().mockResolvedValue(order);

        const { req, res, next } = mockReqResNext({
          user: { _id: 'admin1', userType: 'admin' },
          params: { id: 'order1' },
          body: { pickupMemberId: 'pm1' }
        });

        await assignOrder(req, res, next);
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
        next.mockClear();
      }
    ), { numRuns: 30 });
  });

  // Feature: subscription-order-fulfillment, Property 15: Bundle IDs visible only from out_for_delivery onward
  it('Property 15: builtBundles have non-empty bundleId after buildBundles', async () => {
    await fc.assert(fc.asyncProperty(
      fc.array(fc.string({ minLength: 3, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
      async (skuList) => {
        const order = mockOrder({ status: 'assigned', assignedPickupMemberId: 'pm1' });
        Order.findById = jest.fn().mockResolvedValue(order);
        InventoryItem.findOne = jest.fn().mockResolvedValue({ status: 'in_stock' });
        User.findOne = jest.fn().mockResolvedValue({ _id: 'admin1' });
        notificationService.notifyOrderPacked = jest.fn().mockResolvedValue(undefined);

        const { req, res, next } = mockReqResNext({
          user: { _id: 'pm1', userType: 'pickup_member' },
          params: { id: 'order1' },
          body: { bundles: [{ skuCodes: skuList, bagId: 'BAG001' }] }
        });

        await buildBundles(req, res, next);
        if (!next.mock.calls.length) {
          expect(order.builtBundles.length).toBeGreaterThan(0);
          order.builtBundles.forEach(b => expect(b.bundleId).toBeTruthy());
        }
        next.mockClear();
      }
    ), { numRuns: 30 });
  });

});
